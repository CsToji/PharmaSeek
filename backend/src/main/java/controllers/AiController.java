package controllers;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import services.AiService;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@AllArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping(value = "/analyze", consumes = "multipart/form-data")
    public ResponseEntity<Map<String, Object>> analyzeImage(@RequestParam("image") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Please provide an image file"));
        }

        Map<String, Object> result = aiService.analyzeImage(file);
        boolean success = (boolean) result.getOrDefault("success", false);

        if (success) {
            return ResponseEntity.ok(result);
        } else {
            String error = (String) result.getOrDefault("error", "Failed to analyze image");
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", error));
        }
    }

    @PostMapping(value = "/detect-drug", consumes = "multipart/form-data")
    public ResponseEntity<Map<String, Object>> detectDrugFromImage(@RequestParam("image") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Please provide an image file"));
        }

        try {
            String rawText = aiService.extractTextFromImage(file);
            Map<String, Object> result = aiService.analyzeImage(file);
            
            String matchedDrug = (String) result.get("matchedDrug");
            if (matchedDrug != null) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "matched", true,
                        "drugName", matchedDrug,
                        "rawText", rawText
                ));
            } else {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "matched", false,
                        "rawText", rawText,
                        "suggestions", result.getOrDefault("similarDrugs", java.util.List.of())
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Detection failed: " + e.getMessage()));
        }
    }

    @PostMapping(value = "/ocr", consumes = "multipart/form-data")
    public ResponseEntity<Map<String, Object>> extractText(@RequestParam("image") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Please provide an image file"));
        }

        try {
            String text = aiService.extractTextFromImage(file);
            return ResponseEntity.ok(Map.of("success", true, "text", text));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", "OCR failed: " + e.getMessage()));
        }
    }

    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> test() {
        return ResponseEntity.ok(Map.of("success", true, "message", "AI service is running"));
    }
}