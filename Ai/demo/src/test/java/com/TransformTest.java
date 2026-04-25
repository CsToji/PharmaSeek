package com;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.nio.file.Path;
import java.io.*;

import static org.junit.jupiter.api.Assertions.*;

class TransformTest {

    @TempDir
    Path tempDir;

    @BeforeEach
    void setUp() {
        config.nGramsSerPath = tempDir.resolve("nGrams.ser").toString();
        config.invertedIndexPath = tempDir.resolve("invertedIndex.txt").toString();
        config.innvertedIndexSerPath = tempDir.resolve("invertedIndex.ser").toString();
        config.NGramPath = tempDir.resolve("wordsNGrams.txt").toString();
    }

    // ==================== generaNgrams Tests ====================
    @Test
    void testGeneraNgramsSimpleWord() {
        int[] range = {2, 3, 4};
        ArrayList<String> nGrams = Transform.generaNgrams("test", range);

        // "^test$" = 6 chars
        // Bigrams: 6 - 2 + 1 = 5
        // Trigrams: 6 - 3 + 1 = 4
        // 4-grams: 6 - 4 + 1 = 3
        // Total: 12
        assertEquals(12, nGrams.size());
        assertTrue(nGrams.get(0).startsWith("^"));
        assertTrue(nGrams.get(nGrams.size() - 1).endsWith("$"));
    }

    @Test
    void testGeneraNgramsBigrams() {
        int[] range = {2};
        ArrayList<String> nGrams = Transform.generaNgrams("cat", range);

        // "^cat$" = 5 chars, bigrams: 5 - 2 + 1 = 4
        assertEquals(4, nGrams.size());
        assertEquals("^c", nGrams.get(0));
        assertEquals("t$", nGrams.get(3));
    }

    @Test
    void testGeneraNgramsTrigrams() {
        int[] range = {3};
        ArrayList<String> nGrams = Transform.generaNgrams("cat", range);

        // "^cat$" = 5 chars, trigrams: 5 - 3 + 1 = 3
        assertEquals(3, nGrams.size());
        assertEquals("^ca", nGrams.get(0));
        assertEquals("cat", nGrams.get(1));
        assertEquals("at$", nGrams.get(2));
    }

    @Test
    void testGeneraNgramsFourgrams() {
        int[] range = {4};
        ArrayList<String> nGrams = Transform.generaNgrams("medicine", range);

        // "^medicine$" = 10 chars, 4-grams: 10 - 4 + 1 = 7
        assertEquals(7, nGrams.size());
        assertEquals("^med", nGrams.get(0));
        assertEquals("ine$", nGrams.get(nGrams.size() - 1));
    }

    @Test
    void testGeneraNgramsEmptyWord() {
        int[] range = {2, 3, 4};
        ArrayList<String> nGrams = Transform.generaNgrams("", range);

        // "" becomes "^$" (2 chars) after padding
        // Bigrams: 2 - 2 + 1 = 1 (just "^$")
        assertEquals(1, nGrams.size());
    }

    @Test
    void testGeneraNgramsSingleChar() {
        int[] range = {2, 3};
        ArrayList<String> nGrams = Transform.generaNgrams("a", range);

        // "a" becomes "^a$" (3 chars) after padding
        // Bigrams: 3 - 2 + 1 = 2 (^a, a$)
        // Trigrams: 3 - 3 + 1 = 1 (^a$)
        // Total: 3
        assertEquals(3, nGrams.size());
    }

    @Test
    void testGeneraNgramsWithNumbers() {
        int[] range = {3};
        ArrayList<String> nGrams = Transform.generaNgrams("abc123", range);

        // "^abc123$" = 8 chars, trigrams: 8 - 3 + 1 = 6
        assertEquals(6, nGrams.size());
    }

    @Test
    void testGeneraNgramsWithSpecialChars() {
        int[] range = {2};
        ArrayList<String> nGrams = Transform.generaNgrams("a@b", range);

        // "^a@b$" = 5 chars, bigrams: 5 - 2 + 1 = 4
        assertEquals(4, nGrams.size());
    }

    @Test
    void testGeneraNgramsLargeWord() {
        int[] range = {2};
        ArrayList<String> nGrams = Transform.generaNgrams("pharmaceutical", range);

        // "^pharmaceutical$" = 16 chars, bigrams: 16 - 2 + 1 = 15
        assertEquals(15, nGrams.size());
    }

    @Test
    void testGeneraNgramsMultipleRanges() {
        int[] range = {2, 3, 4, 5};
        ArrayList<String> nGrams = Transform.generaNgrams("hello", range);

        // "^hello$" = 7 chars
        // Bigrams: 7 - 2 + 1 = 6
        // Trigrams: 7 - 3 + 1 = 5
        // 4-grams: 7 - 4 + 1 = 4
        // 5-grams: 7 - 5 + 1 = 3
        // Total: 18
        assertEquals(18, nGrams.size());
    }

    @Test
    void testGeneraNgramsBoundaryMarkers() {
        int[] range = {2};
        ArrayList<String> nGrams = Transform.generaNgrams("ab", range);

        // "^ab$" = 4 chars, bigrams: 4 - 2 + 1 = 3
        assertEquals(3, nGrams.size());
        assertEquals("^a", nGrams.get(0));
        assertEquals("ab", nGrams.get(1));
        assertEquals("b$", nGrams.get(2));
    }

    @Test
    void testGeneraNgramsWithUnicode() {
        int[] range = {2};
        ArrayList<String> nGrams = Transform.generaNgrams("café", range);

        // "^café$" = 6 chars, bigrams: 6 - 2 + 1 = 5
        assertEquals(5, nGrams.size());
    }

    @Test
    void testGeneraNgramsEmptyRange() {
        int[] range = {};
        ArrayList<String> nGrams = Transform.generaNgrams("test", range);

        assertEquals(0, nGrams.size());
    }

    // ==================== Serialization Tests (N-Grams) ====================
    @Test
    void testSerializeNGrams() throws Exception {
        ArrayList<String> original = new ArrayList<>(Arrays.asList("$te", "est", "st$"));

        Transform.serializeNGrams(original);

        File serFile = new File(config.nGramsSerPath);
        assertTrue(serFile.exists());
        assertTrue(serFile.length() > 0);
    }

    @Test
    void testDeserializeNgrams() throws Exception {
        ArrayList<String> original = new ArrayList<>(Arrays.asList("$te", "est", "st$"));

        Transform.serializeNGrams(original);
        ArrayList<String> deserialized = Transform.deserializeNgrams();

        assertEquals(original.size(), deserialized.size());
        assertEquals(original.get(0), deserialized.get(0));
    }

    @Test
    void testSerializeDeserializeNGramsRoundTrip() throws Exception {
        ArrayList<String> original = new ArrayList<>();
        for (int i = 0; i < 100; i++) {
            original.add("ngram" + i);
        }

        Transform.serializeNGrams(original);
        ArrayList<String> deserialized = Transform.deserializeNgrams();

        assertEquals(original.size(), deserialized.size());
        for (int i = 0; i < original.size(); i++) {
            assertEquals(original.get(i), deserialized.get(i));
        }
    }

    @Test
    void testSerializeNGramsEmptyList() throws Exception {
        ArrayList<String> empty = new ArrayList<>();

        Transform.serializeNGrams(empty);

        ArrayList<String> deserialized = Transform.deserializeNgrams();
        assertEquals(0, deserialized.size());
    }

    // ==================== Serialization Tests (Inverted Index) ====================
    @Test
    void testSerializeInvertedIndex() throws Exception {
        HashMap<String, ArrayList<String>> original = new HashMap<>();
        original.put("$te", new ArrayList<>(Arrays.asList("test")));
        original.put("est", new ArrayList<>(Arrays.asList("test", "rest")));

        String indexPath = tempDir.resolve("test_index.ser").toString();
        Transform.serializeInvertedIndex(original, indexPath);

        File serFile = new File(indexPath);
        assertTrue(serFile.exists());
        assertTrue(serFile.length() > 0);
    }

    @Test
    void testSerializeInvertedIndexEmptyMap() throws Exception {
        HashMap<String, ArrayList<String>> empty = new HashMap<>();

        String indexPath = tempDir.resolve("empty_index.ser").toString();
        Transform.serializeInvertedIndex(empty, indexPath);

        File serFile = new File(indexPath);
        assertTrue(serFile.exists());
    }

    // ==================== invertedIndexNGramsFromTXT Tests ====================
    @Test
    void testInvertedIndexNgramsFromTXT() throws Exception {
        String nGramContent = "test: [$te, est, st$]\ncat: [$ca, at$]";
        String nGramPath = tempDir.resolve("wordsNGrams.txt").toString();
        java.nio.file.Files.writeString(java.nio.file.Paths.get(nGramPath), nGramContent);

        Transform.invertedIndexNGramsFromTXT(nGramPath);

        String indexContent = java.nio.file.Files.readString(tempDir.resolve("invertedIndex.txt"));
        assertTrue(indexContent.contains("$te"));
        assertTrue(indexContent.contains("test"));
        assertTrue(indexContent.contains("$ca"));
    }

    @Test
    void testInvertedIndexNgramsFromTXTMultipleWords() throws Exception {
        String nGramContent = "apple: [$ap, app, ppl, ple, le$]\n" +
                              "banana: [$ba, ban, ana, nan, ana, na$]\n" +
                              "cherry: [$ch, che, her, err, rry, ry$]";
        String nGramPath = tempDir.resolve("wordsNGrams.txt").toString();
        java.nio.file.Files.writeString(java.nio.file.Paths.get(nGramPath), nGramContent);

        Transform.invertedIndexNGramsFromTXT(nGramPath);

        String indexContent = java.nio.file.Files.readString(tempDir.resolve("invertedIndex.txt"));
        assertTrue(indexContent.contains("apple"));
        assertTrue(indexContent.contains("banana"));
        assertTrue(indexContent.contains("cherry"));
    }

    @Test
    void testInvertedIndexNgramsEmptyFile() throws Exception {
        String nGramPath = tempDir.resolve("wordsNGrams.txt").toString();
        java.nio.file.Files.writeString(java.nio.file.Paths.get(nGramPath), "");

        Transform.invertedIndexNGramsFromTXT(nGramPath);

        String indexContent = java.nio.file.Files.readString(tempDir.resolve("invertedIndex.txt"));
        assertTrue(indexContent.isEmpty() || indexContent.isBlank());
    }

    @Test
    void testInvertedIndexNgramsFromTXTCreatesFile() throws Exception {
        String nGramContent = "word: [$wo, wor, ord, rd$]";
        String nGramPath = tempDir.resolve("wordsNGrams.txt").toString();
        java.nio.file.Files.writeString(java.nio.file.Paths.get(nGramPath), nGramContent);

        Transform.invertedIndexNGramsFromTXT(nGramPath);

        File indexFile = new File(config.invertedIndexPath);
        assertTrue(indexFile.exists());
    }

    // ==================== Edge Case & Error Tests ====================
    @Test
    void testGeneraNgramsNullRange() {
        try {
            Transform.generaNgrams("test", null);
            fail("Expected NullPointerException");
        } catch (NullPointerException e) {
            // Expected behavior
        }
    }

    @Test
    void testGeneraNgramsNullWord() {
        // Note: Due to string concatenation, null is converted to the string "null"
        // "null" becomes "^null$" (6 chars) after padding, then converted to lowercase
        // Bigrams: 6 - 2 + 1 = 5
        int[] range = {2};
        ArrayList<String> nGrams = Transform.generaNgrams(null, range);
        
        assertEquals(5, nGrams.size());
    }

    @Test
    void testGeneraNgramsRangeExceedsWordLength() {
        int[] range = {10};
        ArrayList<String> nGrams = Transform.generaNgrams("hi", range);

        // Word is 2 chars, range is 10, so no n-grams can be generated
        assertEquals(0, nGrams.size());
    }

    @Test
    void testGeneraNgramsAllRangesExceedWordLength() {
        int[] range = {5, 6, 7};
        ArrayList<String> nGrams = Transform.generaNgrams("cat", range);

        // "cat" becomes "^cat$" (5 chars) after padding
        // 5-grams: 5 - 5 + 1 = 1 (^cat$)
        // 6-grams: 5 - 6 + 1 = 0
        // 7-grams: 5 - 7 + 1 = 0
        // Total: 1
        assertEquals(1, nGrams.size());
    }

    @Test
    void testGeneraNgramsMixedRangesSomeExceed() {
        int[] range = {2, 10};
        ArrayList<String> nGrams = Transform.generaNgrams("cat", range);

        // "cat" becomes "^cat$" (5 chars) after padding
        // Bigrams: 5 - 2 + 1 = 4
        // 10-grams: 5 - 10 + 1 = 0
        // Total: 4
        assertEquals(4, nGrams.size());
    }

    // ==================== Integration Tests ====================
    @Test
    void testNGramGenerationAndSerialization() throws Exception {
        ArrayList<String> nGrams = Transform.generaNgrams("hospital", new int[]{2, 3});
        
        Transform.serializeNGrams(nGrams);
        ArrayList<String> deserialized = Transform.deserializeNgrams();

        assertEquals(nGrams.size(), deserialized.size());
    }

    @Test
    void testMultipleNGramGenerations() throws Exception {
        ArrayList<String> nGrams1 = Transform.generaNgrams("medicine", new int[]{2});
        ArrayList<String> nGrams2 = Transform.generaNgrams("doctor", new int[]{2});
        ArrayList<String> nGrams3 = Transform.generaNgrams("hospital", new int[]{2});

        assertTrue(nGrams1.size() > 0);
        assertTrue(nGrams2.size() > 0);
        assertTrue(nGrams3.size() > 0);
    }

    @Test
    void testNGramConsistency() {
        int[] range = {2};
        ArrayList<String> nGrams1 = Transform.generaNgrams("test", range);
        ArrayList<String> nGrams2 = Transform.generaNgrams("test", range);

        assertEquals(nGrams1.size(), nGrams2.size());
        for (int i = 0; i < nGrams1.size(); i++) {
            assertEquals(nGrams1.get(i), nGrams2.get(i));
        }
    }

    @Test
    void testGeneraNgramsOrderPreserved() {
        int[] range = {2};
        ArrayList<String> nGrams = Transform.generaNgrams("abcde", range);

        // "^abcde$" = 7 chars, bigrams: 7 - 2 + 1 = 6
        assertEquals(6, nGrams.size());
        assertEquals("^a", nGrams.get(0));
        assertEquals("ab", nGrams.get(1));
        assertEquals("bc", nGrams.get(2));
        assertEquals("cd", nGrams.get(3));
        assertEquals("de", nGrams.get(4));
        assertEquals("e$", nGrams.get(5));
    }

    @Test
    void testSerializeLargeNGramList() throws Exception {
        ArrayList<String> large = new ArrayList<>();
        for (int i = 0; i < 10000; i++) {
            large.add("ngram_" + i);
        }

        Transform.serializeNGrams(large);
        ArrayList<String> deserialized = Transform.deserializeNgrams();

        assertEquals(large.size(), deserialized.size());
    }

    @Test
    void testInvertedIndexFileFormatConsistency() throws Exception {
        String nGramContent = "test: [$te, est, st$]\nrest: [$re, est, st$]";
        String nGramPath = tempDir.resolve("wordsNGrams.txt").toString();
        java.nio.file.Files.writeString(java.nio.file.Paths.get(nGramPath), nGramContent);

        Transform.invertedIndexNGramsFromTXT(nGramPath);

        String indexContent = java.nio.file.Files.readString(tempDir.resolve("invertedIndex.txt"));
        
        // Check format consistency
        assertTrue(indexContent.contains(": ["));
        assertTrue(indexContent.contains("]"));
    }
}