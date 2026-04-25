package com;

import java.io.*;

public class Clean {

    static void regexClean(String path) {
        File src = new File(path);
        File cleanedFile = new File(src.getParent(), "cleaned_" + src.getName());
        try {
            BufferedReader reader = new BufferedReader(new FileReader(src));
            BufferedWriter writer = new BufferedWriter(new FileWriter(cleanedFile));
            String line;
            while ((line = reader.readLine()) != null) {
                String cleanedLine = line.replaceAll("[^a-zA-Z0-9]", " ");
                cleanedLine = cleanedLine.replaceAll("\\s+", " ").trim();
                cleanedLine = cleanedLine.toLowerCase();
                cleanedLine = cleanedLine.replaceAll("\\b[^0-9]{0,3}\\b", " ");
                cleanedLine = cleanedLine.replaceAll("\\s\\d\\s", "");
                if (cleanedLine.trim().isEmpty())
                    continue;
                writer.write(cleanedLine);
                writer.newLine();
            }
            reader.close();
            writer.close();
        } catch (IOException e) {
            e.printStackTrace();
        }

    }

    public static void main(String[] args) {
        String filepath = "/home/ayoub/Desktop/PFA-files/App/Ai/demo/src/main/resources/extracted.txt";
        regexClean(filepath);
    }

}
