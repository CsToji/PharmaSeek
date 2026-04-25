package com;

import java.util.ArrayList;
import java.io.*;
import java.util.regex.*;
import java.util.Arrays;
import java.util.HashMap;

class config {
    int[] n = { 2, 3, 4 };
    public static int[] range = { 2, 3, 4 };
    public static String filepath = "/home/ayoub/Desktop/PFA-files/App/Ai/demo/src/main/resources/tunisian_medicine_words.csv";
    public static String wordsPath = "/home/ayoub/Desktop/PFA-files/App/Ai/demo/src/main/resources/tunisian_medicine_words.csv";
    public static String NGramPath = "/home/ayoub/Desktop/PFA-files/App/Ai/demo/src/main/resources/wordsNGrams.txt";
    public static String nGramsSerPath = "/home/ayoub/Desktop/PFA-files/App/Ai/demo/src/main/resources/nGrams.ser";
    public static String invertedIndexPath = "/home/ayoub/Desktop/PFA-files/App/Ai/demo/src/main/resources/invertedIndex.txt";
    public static String innvertedIndexSerPath = "/home/ayoub/Desktop/PFA-files/App/Ai/demo/src/main/resources/invertedIndex.ser";
}

public class Transform {
    public static void writeNgrams(String path) {
        File src = new File(path);
        ArrayList<String> nGrams = new ArrayList<>();
        try {
            BufferedReader reader = new BufferedReader(new FileReader(src));
            FileWriter writer = new FileWriter(new File(config.NGramPath));
            String line;
            while ((line = reader.readLine()) != null) {
                String[] tokens = line.trim().split(",");
                for (String token : tokens) {
                    nGrams = generaNgrams(token, config.range);
                    writer.write(token + ": " + nGrams.toString() + "\n");
                }
            }
            reader.close();
            writer.close();
        } catch (IOException e) {
            e.printStackTrace();
        }

    }

    public static ArrayList<String> generaNgrams(String word, int[] range) {
        word=(  "^" + word + "$").toLowerCase();
        ArrayList<String> nGrams = new ArrayList<>();
        for (int k = 0; k < range.length; k++) {
            for (int j = 0; j < word.length() - range[k] + 1; j++) {
                String nGram = word.substring(j, j + range[k]);
                nGrams.add(nGram);
            }
        }
        return nGrams;

    }   

    public static void serializeNGramsFromTxt() {
        File src = new File(config.wordsPath);
        ArrayList<String> nGrams = new ArrayList<>();
        try {
            BufferedReader reader = new BufferedReader(new FileReader(src));

            String line;
            while ((line = reader.readLine()) != null) {
                String[] tokens = line.trim().split(",");
                FileOutputStream fos = new FileOutputStream(config.nGramsSerPath);
                ObjectOutputStream oos = new ObjectOutputStream(fos);
                for (String token : tokens) {
                    nGrams = generaNgrams(token, config.range);
                    oos.writeObject(nGrams);
                }
                oos.close();
                fos.close();
                reader.close();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static void serializeNGrams(ArrayList<String> var) {
        try {
            FileOutputStream fos = new FileOutputStream(config.nGramsSerPath);
            ObjectOutputStream oos = new ObjectOutputStream(fos);
            oos.writeObject(var);
            oos.close();
            fos.close();
        } catch (FileNotFoundException fnf) {
            fnf.printStackTrace();
        } catch (IOException io) {
            io.printStackTrace();
        }
    }

    public static ArrayList<String> deserializeNgrams() {
        File src = new File(config.nGramsSerPath);
        ArrayList<String> res = new ArrayList<>();
        try {
            FileInputStream fis = new FileInputStream(src);
            ObjectInputStream ois = new ObjectInputStream(fis);
            res = (ArrayList<String>) ois.readObject();
            ois.close();
            fis.close();
        } catch (EOFException eof) {
        } catch (ClassNotFoundException cnf) {
            cnf.printStackTrace();
        } catch (IOException io) {
            io.printStackTrace();
        }
        return res;
    }

    public static HashMap<String, ArrayList<String>> invertedIndexNgrams(String path) {
        HashMap<String, ArrayList<String>> invertedIndexStruct = new HashMap<>();
        File src = new File(path);
        String ngram = null;
        String[] words = null;
        try {
            BufferedReader reader = new BufferedReader(new FileReader(src));
            String line;
            while ((line = reader.readLine()) != null) {
                Pattern p = Pattern.compile(".+(?=:)");
                Matcher m = p.matcher(line);
                if (m.find()) {
                    ngram = m.group();  
                }
                p = Pattern.compile("(?<=\\[).+(?=\\])");
                m = p.matcher(line);
                if (m.find()) {
                    words = m.group().split(", "); 
                }
                for (String word : words) {
                    if (invertedIndexStruct.containsKey(ngram)) {
                        invertedIndexStruct.get(ngram).add(word);
                    } else {
                        invertedIndexStruct.put(ngram, new ArrayList<String>(Arrays.asList(word)));
                    }
                }
            }
            reader.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return invertedIndexStruct;
    }

    public static void invertedIndexNGramsFromTXT(String path) {
        HashMap<String, ArrayList<String>> invertedIndexStruct = new HashMap<>();
        File src = new File(path);
        String word = null;
        String[] nGrams = null;
        try {
            BufferedReader reader = new BufferedReader(new FileReader(src));
            String line;
            while ((line = reader.readLine()) != null) {
                Pattern p = Pattern.compile(".+(?=:)");
                Matcher m = p.matcher(line);
                if (m.find()) {
                    word = m.group();
                }
                p = Pattern.compile("(?<=\\[).+(?=\\])");
                m = p.matcher(line);
                if (m.find()) {
                    nGrams = m.group().split(", ");
                }
                for (String ngram : nGrams) {
                    if (invertedIndexStruct.containsKey(ngram)) {
                        invertedIndexStruct.get(ngram).add(word);
                    } else {
                        invertedIndexStruct.put(ngram, new ArrayList<String>(Arrays.asList(word)));
                    }
                }
            }
            reader.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
        File invertedIndexFile = new File(config.invertedIndexPath);
        try {
            BufferedWriter writer = new BufferedWriter(new FileWriter(invertedIndexFile));
            for (String ngram : invertedIndexStruct.keySet()) {
                writer.write(ngram + ": " + invertedIndexStruct.get(ngram).toString() + "\n");
            }
            writer.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static void serializeInvertedIndex(HashMap<String, ArrayList<String>> var, String path) {
        try {
            FileOutputStream fos = new FileOutputStream(new File(path));
            ObjectOutputStream oos = new ObjectOutputStream(fos);
            oos.writeObject(var);
            oos.close();
            fos.close();
        } catch (FileNotFoundException fnf) {
            fnf.printStackTrace();
        } catch (IOException io) {
            io.printStackTrace();
        }
    }

    public static HashMap<String, ArrayList<String>> deserializeInvertedIndex(String path) {
        File src = new File(path);
        HashMap<String, ArrayList<String>> res = new HashMap<>();
        try {
            FileInputStream fis = new FileInputStream(src);
            ObjectInputStream ois = new ObjectInputStream(fis); 
            res = (HashMap<String, ArrayList<String>>) ois.readObject();
            ois.close();
            fis.close();
        } catch (EOFException eof) {
        } catch (ClassNotFoundException cnf) {
            cnf.printStackTrace();
        } catch (IOException io) {
            io.printStackTrace();
        }
        return res;
    }
    public static HashMap<String, Integer> retrieveCandidates(){
        return null;
    }

    public static HashMap<String, Integer> retrieveCandidates(String input, String invertedIndexSerPath){
        HashMap<String, Integer> candidates = new HashMap<>();
        ArrayList<String> nGrams = generaNgrams(input, config.range);
        HashMap<String, ArrayList<String>> invertedIndex = deserializeInvertedIndex(invertedIndexSerPath);
        for (String ngram : nGrams) {
            if (invertedIndex.containsKey(ngram)) {
                if(candidates.containsKey(ngram)){
                    candidates.put(ngram, candidates.get(ngram) + 1);
                } else {
                    candidates.put(ngram, 1);
                }
            }
        }
        return candidates;
    }
    public static HashMap<String, Integer> cleanCandidates(HashMap<String, Integer> candidates, String input, int threshold) {
        HashMap<String, Integer> res = retrieveCandidates(input,config.invertedIndexPath);
        for(String x : candidates.keySet()){
            if(candidates.get(x)<=threshold){
                res.remove(x);
            }
        }
        return res;
    }
    public static String cosineSimilarity(String input){
        ArrayList<String> inputNGrams = generaNgrams(input, config.range);
        HashMap<String, ArrayList<String>> invertedIndex = deserializeInvertedIndex(config.innvertedIndexSerPath);
        
        HashMap<String, Integer> wordScores = new HashMap<>();
        
        for (String ngram : inputNGrams) {
            if (invertedIndex.containsKey(ngram)) {
                for (String word : invertedIndex.get(ngram)) {
                    wordScores.put(word, wordScores.getOrDefault(word, 0) + 1);
                }
            }
        }
        
        int threshold = input.length() / 2 - 1;
        String bestMatch = null;
        float bestScore = 0;
        
        for (String word : wordScores.keySet()) {
            if (wordScores.get(word) <= threshold) continue;
            
            ArrayList<String> wordNGrams = generaNgrams(word, config.range);
            int intersection = 0;
            for (String ngram : inputNGrams) {
                if (wordNGrams.contains(ngram)) {
                    intersection++;
                }
            }
            
            float score = (float) intersection / (float) Math.sqrt(inputNGrams.size() * wordNGrams.size());
            
            if (score > bestScore) {
                bestScore = score;
                bestMatch = word;
            }
        }
        
        return bestMatch;
    }


    public static void main(String[] args) {
        String input = "abultes";
        String bestMatch = cosineSimilarity(input);
        System.out.println("Best match for '" + input + "': " + bestMatch);
    }
}