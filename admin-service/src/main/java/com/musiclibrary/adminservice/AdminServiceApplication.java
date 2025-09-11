package com.musiclibrary.adminservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;

@SpringBootApplication
@EnableDiscoveryClient
public class AdminServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(AdminServiceApplication.class, args);
    }

    @Bean
    @LoadBalanced
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    @EventListener(ApplicationReadyEvent.class)
    public void openBrowser() {
        try {
            String url = "http://localhost:9001/";
            java.awt.Desktop desktop = java.awt.Desktop.isDesktopSupported() ? java.awt.Desktop.getDesktop() : null;
            if (desktop != null && desktop.isSupported(java.awt.Desktop.Action.BROWSE)) {
                desktop.browse(new java.net.URI(url));
            }
        } catch (Exception ignored) {
        }
    }
}
