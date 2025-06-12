package com.twinvision.readings_api.service;

import com.twinvision.readings_api.model.Reading;
import org.springframework.stereotype.Service;
import com.twinvision.readings_api.repository.ReadingRepository;

import java.util.List;

@Service
public class ReadingService {
    private final ReadingRepository readingRepository;

    public ReadingService(ReadingRepository readingRepository) {
        this.readingRepository = readingRepository;
    }

    public List<Reading> listarReadings() { return readingRepository.findAll(); }

    public Reading salvarReading(Reading reading) { return readingRepository.save(reading); }

    public List<Reading> listarReadingsPorSensorId(String sensorId ) { return readingRepository.findBySensorId(sensorId); }
}
