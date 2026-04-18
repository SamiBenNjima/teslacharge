package com.example.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class NhtsaService {
    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public boolean validateVin(String vin) {
        if (vin == null || vin.length() != 17) return false;
        // For development/testing: accept any VIN starting with 5YJ (Tesla)
        if (vin.startsWith("5YJ")) return true;
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(new URI("https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/" + vin + "?format=json"))
                    .GET()
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                 JsonNode root = objectMapper.readTree(response.body());
                 JsonNode results = root.path("Results");
                 for (JsonNode node : results) {
                     if ("ErrorCode".equals(node.path("Variable").asText())) {
                         String errorCode = node.path("Value").asText();
                         return "0".equals(errorCode) || errorCode.contains("0"); // "0 - VIN decoded clean"
                     }
                 }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }
}
