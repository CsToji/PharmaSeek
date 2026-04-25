package com;

import java.awt.image.BufferedImage;
import java.awt.image.DataBufferByte;
import java.io.*;
import java.util.ArrayList;
import java.util.List;
import net.sourceforge.tess4j.*;
import org.opencv.core.*;
import org.opencv.imgcodecs.Imgcodecs;
import org.opencv.imgproc.Imgproc;
import org.opencv.photo.Photo;

class OpenCVExtraction {

    private static final String BASE_PATH =
        System.getProperty("user.home") + "/Desktop/PFA-files/App/Ai/demo";
    private static final String OUTPUT_FILE =
        BASE_PATH + "/src/main/resources/extracted.txt";
    private static final String PROCESSED_DIR =
        BASE_PATH + "/src/main/resources/processed/";
    private static final String DEBUG_DIR =
        BASE_PATH + "/src/main/resources/debug/";
    private static final String TESSDATA_PATH =
        "/usr/share/tesseract-ocr/5/tessdata/";
    private static final String OCR_LANGUAGE = "eng+fra+ara";
    private static final boolean ENABLE_DEBUG = true;

    static {
        nu.pattern.OpenCV.loadLocally();
    }

    static void writeToFile(String text) {
        if (text == null || text.isEmpty()) return;
        try {
            File outputFile = new File(OUTPUT_FILE);
            File parentDir = outputFile.getParentFile();
            if (parentDir != null && !parentDir.exists()) {
                parentDir.mkdirs();
            }
            try (FileWriter writer = new FileWriter(outputFile)) {
                writer.write(text);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    static void saveDebugImage(Mat image, String filename) {
        if (!ENABLE_DEBUG || image == null) return;
        try {
            File debugDir = new File(DEBUG_DIR);
            if (!debugDir.exists()) {
                debugDir.mkdirs();
            }
            Imgcodecs.imwrite(DEBUG_DIR + filename, image);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    static Mat bufferedImageToMat(BufferedImage image) {
        if (image == null) return null;
        BufferedImage convertedImage = new BufferedImage(
            image.getWidth(),
            image.getHeight(),
            BufferedImage.TYPE_3BYTE_BGR
        );
        convertedImage.getGraphics().drawImage(image, 0, 0, null);
        byte[] pixels = (
            (DataBufferByte) convertedImage.getRaster().getDataBuffer()
        ).getData();
        Mat mat = new Mat(
            convertedImage.getHeight(),
            convertedImage.getWidth(),
            CvType.CV_8UC3
        );
        mat.put(0, 0, pixels);
        return mat;
    }

    static BufferedImage matToBufferedImage(Mat mat) {
        if (mat == null) return null;
        int type = BufferedImage.TYPE_BYTE_GRAY;
        if (mat.channels() > 1) {
            type = BufferedImage.TYPE_3BYTE_BGR;
        }
        BufferedImage image = new BufferedImage(mat.cols(), mat.rows(), type);
        byte[] data = new byte[mat.rows() * mat.cols() * (int) mat.elemSize()];
        mat.get(0, 0, data);
        image.getRaster().setDataElements(0, 0, mat.cols(), mat.rows(), data);
        return image;
    }

    static double detectRotationAngle(Mat image) {
        Mat gray = new Mat();
        if (image.channels() == 3) {
            Imgproc.cvtColor(image, gray, Imgproc.COLOR_BGR2GRAY);
        } else {
            gray = image.clone();
        }
        Imgproc.GaussianBlur(gray, gray, new Size(5, 5), 0);
        Mat binary = new Mat();
        Imgproc.adaptiveThreshold(
            gray,
            binary,
            255,
            Imgproc.ADAPTIVE_THRESH_GAUSSIAN_C,
            Imgproc.THRESH_BINARY_INV,
            21,
            10
        );
        saveDebugImage(binary, "opencv_1_binary.png");
        Mat edges = new Mat();
        Imgproc.Canny(binary, edges, 50, 150, 3, false);
        saveDebugImage(edges, "opencv_2_edges.png");
        Mat lines = new Mat();
        Imgproc.HoughLinesP(edges, lines, 1, Math.PI / 180, 100, 100, 10);
        if (lines.rows() == 0) {
            return 0;
        }
        List<Double> angles = new ArrayList<>();
        for (int i = 0; i < lines.rows(); i++) {
            double[] line = lines.get(i, 0);
            double x1 = line[0],
                y1 = line[1];
            double x2 = line[2],
                y2 = line[3];
            double angle = Math.toDegrees(Math.atan2(y2 - y1, x2 - x1));
            if (angle < -45) angle += 90;
            if (angle > 45) angle -= 90;
            if (Math.abs(angle) < 45) {
                angles.add(angle);
            }
        }
        if (angles.isEmpty()) {
            return 0;
        }
        angles.sort(Double::compareTo);
        double medianAngle = angles.get(angles.size() / 2);
        gray.release();
        binary.release();
        edges.release();
        lines.release();
        return medianAngle;
    }

    static Mat rotateImage(Mat image, double angle) {
        if (Math.abs(angle) < 0.1) {
            return image.clone();
        }
        Point center = new Point(image.cols() / 2.0, image.rows() / 2.0);
        Mat rotationMatrix = Imgproc.getRotationMatrix2D(center, angle, 1.0);
        double abs_cos = Math.abs(rotationMatrix.get(0, 0)[0]);
        double abs_sin = Math.abs(rotationMatrix.get(0, 1)[0]);
        int bound_w = (int) (image.rows() * abs_sin + image.cols() * abs_cos);
        int bound_h = (int) (image.rows() * abs_cos + image.cols() * abs_sin);
        rotationMatrix.put(
            0,
            2,
            rotationMatrix.get(0, 2)[0] + bound_w / 2.0 - center.x
        );
        rotationMatrix.put(
            1,
            2,
            rotationMatrix.get(1, 2)[0] + bound_h / 2.0 - center.y
        );
        Mat rotated = new Mat();
        Imgproc.warpAffine(
            image,
            rotated,
            rotationMatrix,
            new Size(bound_w, bound_h),
            Imgproc.INTER_CUBIC,
            Core.BORDER_CONSTANT,
            new Scalar(255, 255, 255)
        );
        rotationMatrix.release();
        return rotated;
    }

    static Mat removeBlackBorders(Mat image) {
        Mat gray = new Mat();
        if (image.channels() == 3) {
            Imgproc.cvtColor(image, gray, Imgproc.COLOR_BGR2GRAY);
        } else {
            gray = image.clone();
        }
        Mat binary = new Mat();
        Imgproc.threshold(gray, binary, 250, 255, Imgproc.THRESH_BINARY_INV);
        List<MatOfPoint> contours = new ArrayList<>();
        Mat hierarchy = new Mat();
        Imgproc.findContours(
            binary,
            contours,
            hierarchy,
            Imgproc.RETR_EXTERNAL,
            Imgproc.CHAIN_APPROX_SIMPLE
        );
        if (contours.isEmpty()) {
            gray.release();
            binary.release();
            hierarchy.release();
            return image.clone();
        }
        Rect boundingRect = Imgproc.boundingRect(contours.get(0));
        for (int i = 1; i < contours.size(); i++) {
            Rect rect = Imgproc.boundingRect(contours.get(i));
            boundingRect = union(boundingRect, rect);
        }
        int padding = 20;
        boundingRect.x = Math.max(0, boundingRect.x - padding);
        boundingRect.y = Math.max(0, boundingRect.y - padding);
        boundingRect.width = Math.min(
            image.cols() - boundingRect.x,
            boundingRect.width + 2 * padding
        );
        boundingRect.height = Math.min(
            image.rows() - boundingRect.y,
            boundingRect.height + 2 * padding
        );
        Mat cropped = new Mat(image, boundingRect);
        gray.release();
        binary.release();
        hierarchy.release();
        return cropped.clone();
    }

    static Rect union(Rect r1, Rect r2) {
        int x = Math.min(r1.x, r2.x);
        int y = Math.min(r1.y, r2.y);
        int width = Math.max(r1.x + r1.width, r2.x + r2.width) - x;
        int height = Math.max(r1.y + r1.height, r2.y + r2.height) - y;
        return new Rect(x, y, width, height);
    }

    static Mat preprocessImage(Mat image) {
        Mat processed = image.clone();
        if (processed.channels() == 3) {
            Imgproc.cvtColor(processed, processed, Imgproc.COLOR_BGR2GRAY);
        }
        Mat denoised = new Mat();
        Photo.fastNlMeansDenoising(processed, denoised, 10, 7, 21);
        processed.release();
        processed = denoised;
        Mat binary = new Mat();
        Imgproc.adaptiveThreshold(
            processed,
            binary,
            255,
            Imgproc.ADAPTIVE_THRESH_GAUSSIAN_C,
            Imgproc.THRESH_BINARY,
            11,
            2
        );
        Mat kernel = Imgproc.getStructuringElement(
            Imgproc.MORPH_RECT,
            new Size(2, 2)
        );
        Mat morphed = new Mat();
        Imgproc.morphologyEx(binary, morphed, Imgproc.MORPH_CLOSE, kernel);
        processed.release();
        binary.release();
        kernel.release();
        return morphed;
    }

    static Mat upscaleImage(Mat image, double targetWidth) {
        if (image.cols() >= targetWidth) {
            return image.clone();
        }
        double scale = targetWidth / image.cols();
        int newWidth = (int) (image.cols() * scale);
        int newHeight = (int) (image.rows() * scale);
        Mat resized = new Mat();
        Imgproc.resize(
            image,
            resized,
            new Size(newWidth, newHeight),
            0,
            0,
            Imgproc.INTER_CUBIC
        );
        return resized;
    }

    static void detectText(String imagePath, String savePath) {
        Mat image = Imgcodecs.imread(imagePath);
        if (image.empty()) {
            return;
        }
        saveDebugImage(image, "1_original.png");
        Mat upscaled = upscaleImage(image, 2400);
        saveDebugImage(upscaled, "2_upscaled.png");
        double angle = detectRotationAngle(upscaled);
        Mat rotated = rotateImage(upscaled, angle);
        saveDebugImage(rotated, "3_rotated.png");
        Mat cropped = removeBlackBorders(rotated);
        saveDebugImage(cropped, "4_cropped.png");
        Mat processed1 = preprocessImage(cropped);
        saveDebugImage(processed1, "5a_preprocessed_aggressive.png");
        Mat gray = new Mat();
        if (cropped.channels() == 3) {
            Imgproc.cvtColor(cropped, gray, Imgproc.COLOR_BGR2GRAY);
        } else {
            gray = cropped.clone();
        }
        Mat processed2 = new Mat();
        Imgproc.threshold(
            gray,
            processed2,
            0,
            255,
            Imgproc.THRESH_BINARY + Imgproc.THRESH_OTSU
        );
        saveDebugImage(processed2, "5b_preprocessed_simple.png");
        Mat processed3 = new Mat();
        Core.bitwise_not(processed2, processed3);
        saveDebugImage(processed3, "5c_preprocessed_inverted.png");
        if (savePath != null && !savePath.isEmpty()) {
            try {
                File saveFile = new File(savePath);
                File saveDir = saveFile.getParentFile();
                if (saveDir != null && !saveDir.exists()) {
                    saveDir.mkdirs();
                }
                Imgcodecs.imwrite(savePath, processed1);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        StringBuilder allText = new StringBuilder();
        try {
            ITesseract tesseract = new Tesseract();
            tesseract.setDatapath(TESSDATA_PATH);
            tesseract.setLanguage(OCR_LANGUAGE);
            String text1 = tryOCRWithMultiplePSM(
                tesseract,
                matToBufferedImage(processed1)
            );
            if (text1 != null && !text1.trim().isEmpty()) {
                allText.append(text1).append("\n");
            }
            String text2 = tryOCRWithMultiplePSM(
                tesseract,
                matToBufferedImage(processed2)
            );
            if (text2 != null && !text2.trim().isEmpty()) {
                allText.append(text2).append("\n");
            }
            String text3 = tryOCRWithMultiplePSM(
                tesseract,
                matToBufferedImage(processed3)
            );
            if (text3 != null && !text3.trim().isEmpty()) {
                allText.append(text3).append("\n");
            }
            String text4 = tryOCRWithMultiplePSM(
                tesseract,
                matToBufferedImage(processed1)
            );
            if (text4 != null && !text4.trim().isEmpty()) {
                allText.append(text4).append("\n");
            }
            String finalText = deduplicateText(allText.toString());
            if (finalText != null && !finalText.trim().isEmpty()) {
                writeToFile(finalText);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        image.release();
        upscaled.release();
        rotated.release();
        cropped.release();
        processed1.release();
        processed2.release();
        processed3.release();
        gray.release();
    }

    static String tryOCRWithMultiplePSM(
        ITesseract tesseract,
        BufferedImage image
    ) {
        String bestText = "";
        int bestLength = 0;
        int[] psmModes = { 3, 6, 4, 11, 12, 1 };
        for (int psm : psmModes) {
            try {
                tesseract.setPageSegMode(psm);
                String text = tesseract.doOCR(image);
                if (text != null && text.trim().length() > bestLength) {
                    bestText = text;
                    bestLength = text.trim().length();
                }
            } catch (Exception e) {}
        }
        return bestText;
    }

    static String deduplicateText(String text) {
        if (text == null || text.trim().isEmpty()) {
            return "";
        }
        String[] lines = text.split("\n");
        java.util.LinkedHashSet<String> uniqueLines =
            new java.util.LinkedHashSet<>();
        for (String line : lines) {
            String trimmed = line.trim();
            if (!trimmed.isEmpty()) {
                uniqueLines.add(trimmed);
            }
        }
        return String.join("\n", uniqueLines);
    }

    static void detectTextFromDir(String dirPath) {
        if (dirPath == null || dirPath.isEmpty()) return;
        File dir = new File(dirPath);
        if (!dir.exists() || !dir.isDirectory()) return;
        File[] files = dir.listFiles((d, name) -> {
            String lower = name.toLowerCase();
            return (
                lower.endsWith(".png") ||
                lower.endsWith(".jpg") ||
                lower.endsWith(".jpeg") ||
                lower.endsWith(".bmp")
            );
        });
        if (files == null || files.length == 0) return;
        for (File file : files) {
            try {
                detectText(
                    file.getAbsolutePath(),
                    PROCESSED_DIR + file.getName()
                );
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}

public class Detect {

    public static void main(String[] args) {
        String imagePath =
            args.length > 0
                ? args[0]   
                : System.getProperty("user.home") +
                  "/Desktop/PFA-files/App/Ai/demo/src/main/resources/images";
        OpenCVExtraction.detectTextFromDir(imagePath);
    }
}
