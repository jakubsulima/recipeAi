package org.jakub.backendapi.services;

import org.jakub.backendapi.exceptions.AppException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitService {

    private final ConcurrentHashMap<String, Deque<Long>> requestBuckets = new ConcurrentHashMap<>();

    public void assertAllowed(String key, int maxRequests, long windowMillis, String errorMessage) {
        long now = System.currentTimeMillis();
        Deque<Long> timestamps = requestBuckets.computeIfAbsent(key, ignored -> new ArrayDeque<>());

        synchronized (timestamps) {
            trimExpiredRequests(timestamps, now, windowMillis);

            if (timestamps.size() >= maxRequests) {
                throw new AppException(errorMessage, HttpStatus.TOO_MANY_REQUESTS);
            }

            timestamps.addLast(now);
        }
    }

    public int getCurrentRequestCount(String key, long windowMillis) {
        long now = System.currentTimeMillis();
        Deque<Long> timestamps = requestBuckets.get(key);
        if (timestamps == null) {
            return 0;
        }

        synchronized (timestamps) {
            trimExpiredRequests(timestamps, now, windowMillis);
            return timestamps.size();
        }
    }

    private void trimExpiredRequests(Deque<Long> timestamps, long now, long windowMillis) {
        while (!timestamps.isEmpty() && now - timestamps.peekFirst() > windowMillis) {
            timestamps.pollFirst();
        }
    }
}
