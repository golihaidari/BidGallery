package dk.dtu.backend.service;

import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class MetricService {

    private final MeterRegistry meterRegistry;

    @Autowired
    public MetricService(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
    }

    // Record success/failure events
    public void incrementCounter(String name, String... tags) {
        meterRegistry.counter(name, tags).increment();
    }

    // Record duration in milliseconds
    public void recordDuration(String name, long millis, String... tags) {
        meterRegistry.timer(name, tags).record(Duration.ofMillis(millis));
    }

}
