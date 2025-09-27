package org.example;

public class CheckParams {
    public String CheckParams(double x, double y, double r) {
        if (x > 0 && y < 0) {
            return "Мимо";
        } // 4 четверть
        if (x < 0 && y < 0) { // 3 четверть
            if (x >= -r / 2 && y >= -r) {
                return "ОК";
            }
            return "Мимо";
        }
        if (x >= 0 && y >= 0) { // 1 четверть
            if (x * x + y * y <= r * r) {
                return "ОК";
            }
            return "Мимо";
        }
        if (y >= 0 && x <= 0) { // 2 четверть
            if (y <= x + r) {
                return "ОК";
            }
        }
        return "Мимо";
    }
}
