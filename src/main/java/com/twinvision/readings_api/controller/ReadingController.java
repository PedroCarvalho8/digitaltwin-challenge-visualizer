package com.twinvision.readings_api.controller;

import com.twinvision.readings_api.model.Reading;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.twinvision.readings_api.service.ReadingService;

import java.util.List;

@RestController
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:8080",
        "http://localhost:8081",
        "http://192.168.0.10:19000"
})
@RequestMapping("/api/readings")
public class ReadingController {
    private final ReadingService readingService;

    public ReadingController(ReadingService readingService) {
        this.readingService = readingService;
    }

    @PostMapping
    public ResponseEntity<?> salvarLeitura(@RequestBody Reading reading) {
        System.out.println("Objeto recebido: " + reading.toString());
        return ResponseEntity.ok(readingService.salvarReading(reading));
    }

    @GetMapping
    public ResponseEntity<List<Reading>> listarLeituras() {
        return ResponseEntity.ok(readingService.listarReadings());
    }

    @GetMapping("/{sensorId}")
    public ResponseEntity<List<Reading>> filtrarPorSensor(@PathVariable String sensorId) {
        return ResponseEntity.ok(readingService.listarReadingsPorSensorId(sensorId));
    }
}
