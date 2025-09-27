package org.example;

import java.nio.charset.Charset;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.logging.FileHandler;
import java.util.logging.Level;
import java.util.logging.Logger;

import java.io.InputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

import com.fasterxml.jackson.databind.*;


import com.fastcgi.FCGIInterface;

public class Main {
    private static final String RESULT_JSON = """
            {
                "x": "%s",
                "y": "%s",
                "r": "%s",
                "date": "%s",
                "worktime": "%s",
                "result": "%s"
            }
            """;

    public static void main(String[] args) throws Exception {
        Logger logger = Logger.getLogger(Main.class.getName());
        FileHandler fh = new FileHandler("/home/studs/s467141/httpd-root/fcgi-bin/my_log.log", false);
        logger.addHandler(fh);
        FCGIInterface fcgi = new FCGIInterface();
        logger.log(Level.INFO, "Server is working");

        while (fcgi.FCGIaccept() >= 0) {
            try {
                String method = System.getProperty("REQUEST_METHOD");
                logger.log(Level.INFO, "Server got request.");

                if (!"POST".equalsIgnoreCase(method)) {
                    String s = "HTTP/1.1 405 Method Not Allowed\r\n" +
                            "Allow: POST\r\n" +
                            "Content-Length: 0\r\n" +
                            "\r\n";
                    System.out.print(s);
                    System.out.flush();
                    continue;
                }

                int len = parseIntSafe(System.getProperty("CONTENT_LENGTH"));
                String request = new String(readExactly(System.in, len), Charset.defaultCharset());

                ObjectMapper m = new ObjectMapper();

                JsonNode root = m.readTree(request);
                double x = root.path("x").asDouble();
                double y = root.path("y").asDouble();
                double r = root.path("r").asDouble();

                Instant startTime = Instant.now();
                String result = new CheckParams().CheckParams(x, y, r);
                Instant endTime = Instant.now();


                String json = String.format(RESULT_JSON, x, y, r,LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")), ChronoUnit.MICROS.between(startTime, endTime), result);

                String http = "HTTP/1.1 200 OK\r\n" +
                        "Content-Type: application/json\r\n" +
                        "Content-Length: " + json.getBytes(StandardCharsets.UTF_8).length + "\r\n" +
                        "\r\n" + json;
                System.out.print(http);
                System.out.flush();
                logger.log(Level.INFO, "Server sent request.");
            } catch (Exception e) {logger.log(Level.WARNING, "Server had error: " + e);}
        }
    }

    private static int parseIntSafe(String s) {
        try { return Integer.parseInt(s.trim()); } catch (Exception e) { return 0; }
    }

    private static byte[] readExactly(InputStream in, int n) throws IOException {
        byte[] buf = new byte[n];
        int off = 0;
        while (off < n) {
            int r = in.read(buf, off, n - off);
            if (r < 0) break;
            off += r;
        }
        if (off == n) return buf;
        byte[] cut = new byte[off];
        System.arraycopy(buf, 0, cut, 0, off);
        return cut;
    }
}
