package services;

import entities.Drug;
import lombok.AllArgsConstructor;
import net.sourceforge.tess4j.Tesseract;
import repositories.DrugRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class AiService {

    private final DrugRepository drugRepository;
    private static final String TESSDATA_PATH = "/usr/share/tesseract-ocr/5/tessdata/";
    private static final String OCR_LANGUAGES = "eng+fra+ara";
    private static final Logger log = LoggerFactory.getLogger(AiService.class);

    public String extractTextFromImage(MultipartFile file) throws Exception {
        if (file == null || file.isEmpty()) {
            return "";
        }

        log.info("📤 Image uploaded: {} ({} bytes)", file.getOriginalFilename(), file.getSize());

        Tesseract tesseract = new Tesseract();
        tesseract.setDatapath(TESSDATA_PATH);
        tesseract.setLanguage(OCR_LANGUAGES);

        try (InputStream is = file.getInputStream()) {
            BufferedImage image = javax.imageio.ImageIO.read(is);
            if (image == null) {
                return "";
            }

            String bestText = "";
            int bestLength = 0;

            int[] psmModes = {3, 6, 4, 11, 12, 1};
            for (int psm : psmModes) {
                try {
                    tesseract.setPageSegMode(psm);
                    String text = tesseract.doOCR(image);
                    if (text != null && text.trim().length() > bestLength) {
                        bestText = text;
                        bestLength = text.trim().length();
                    }
                } catch (Exception ignored) {
                }
            }

            return deduplicateText(bestText);
        }
    }

    private String deduplicateText(String text) {
        if (text == null || text.trim().isEmpty()) {
            return "";
        }
        String[] lines = text.split("\n");
        LinkedHashSet<String> uniqueLines = new LinkedHashSet<>();
        for (String line : lines) {
            String trimmed = line.trim();
            if (!trimmed.isEmpty()) {
                uniqueLines.add(trimmed);
            }
        }
        return String.join("\n", uniqueLines);
    }

    public String cleanText(String rawText) {
        if (rawText == null || rawText.isEmpty()) {
            return "";
        }
        String cleaned = rawText.replaceAll("[^a-zA-Z0-9]", " ");
        cleaned = cleaned.replaceAll("\\s+", " ").trim();
        cleaned = cleaned.toLowerCase();
        cleaned = cleaned.replaceAll("\\b[^0-9]{0,3}\\b", " ");
        cleaned = cleaned.replaceAll("\\s\\d\\s", "");
        return cleaned.trim();
    }

    public List<String> generateNgrams(String word, int[] range) {
        word = "^" + word.toLowerCase() + "$";
        List<String> nGrams = new ArrayList<>();
        for (int k : range) {
            if (k > word.length()) continue;
            for (int j = 0; j < word.length() - k + 1; j++) {
                nGrams.add(word.substring(j, j + k));
            }
        }
        return nGrams;
    }

    public Map<String, Integer> getCandidates(String input, List<String> medicineNames) {
        Map<String, Integer> scores = new HashMap<>();
        List<String> inputNGrams = generateNgrams(input, new int[]{2, 3, 4});

        for (String medicine : medicineNames) {
            List<String> medicineNGrams = generateNgrams(medicine, new int[]{2, 3, 4});
            int intersection = 0;
            Set<String> medicineSet = new HashSet<>(medicineNGrams);
            for (String ngram : inputNGrams) {
                if (medicineSet.contains(ngram)) {
                    intersection++;
                }
            }
            if (intersection > 0) {
                float score = (float) intersection / (float) Math.sqrt(inputNGrams.size() * medicineNGrams.size());
                if (score > 0.1) {
                    scores.put(medicine, (int) (score * 100));
                }
            }
        }

        return scores.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (e1, e2) -> e1,
                        LinkedHashMap::new
                ));
    }

    public String findBestMatch(String ocrText, List<Drug> drugs) {
        if (drugs == null || drugs.isEmpty()) {
            return null;
        }

        String cleaned = cleanText(ocrText);
        if (cleaned.isEmpty()) {
            return null;
        }

        List<String> medicineNames = drugs.stream()
                .map(Drug::getName)
                .filter(Objects::nonNull)
                .filter(n -> !n.isEmpty())
                .map(String::toLowerCase)
                .collect(Collectors.toList());

        Map<String, Integer> candidates = getCandidates(cleaned, medicineNames);

        if (candidates.isEmpty()) {
            return null;
        }

        Map.Entry<String, Integer> best = candidates.entrySet().iterator().next();
        return best.getValue() > 10 ? best.getKey() : null;
    }

    public Map<String, Object> analyzeImage(MultipartFile file) {
        Map<String, Object> result = new HashMap<>();
        result.put("success", false);

        try {
            String rawText = extractTextFromImage(file);
            log.info("📝 Extracted text: {}", rawText);
            result.put("rawText", rawText);

            String cleanedText = cleanText(rawText);
            result.put("cleanedText", cleanedText);

            List<Drug> drugs = drugRepository.findAll();
            String bestMatch = findBestMatch(rawText, drugs);
            result.put("matchedDrug", bestMatch);

            if (bestMatch != null) {
                log.info("✅ Matched medicine: {}", bestMatch);
                Drug matched = drugs.stream()
                        .filter(d -> d.getName() != null && d.getName().toLowerCase().equals(bestMatch))
                        .findFirst()
                        .orElse(null);
                if (matched != null) {
                    result.put("drugId", matched.getId());
                    result.put("drugName", matched.getName());
                    result.put("category", matched.getCategory());
                    result.put("manufacturer", matched.getManufacturer());
                }
            } else {
                log.warn("⚠️ No matching medicine found");
            }

List<Drug> similarDrugs = drugs.stream()
                    .filter(d -> d.getName() != null && d.getName().toLowerCase().contains(cleanedText.substring(0, Math.min(5, cleanedText.length()))))
                    .limit(5)
                    .collect(java.util.stream.Collectors.toList());
            List<String> similarNames = similarDrugs.stream()
                    .map(Drug::getName)
                    .collect(java.util.stream.Collectors.toList());
            result.put("similarDrugs", similarNames);

            result.put("success", true);
        } catch (Exception e) {
            log.error("❌ Error analyzing image: {}", e.getMessage());
            result.put("error", e.getMessage());
        }

        return result;
    }
}