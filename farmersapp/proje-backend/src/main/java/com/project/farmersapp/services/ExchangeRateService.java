package com.project.farmersapp.services;

import com.project.farmersapp.models.ExchangeRate;
import com.project.farmersapp.dtos.ExchangeRateDTO;
import com.project.farmersapp.repositories.ExchangeRateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.annotation.Transactional;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

import jakarta.annotation.PostConstruct;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.StringReader;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExchangeRateService {

    private final ExchangeRateRepository repository;
    private final RestTemplate restTemplate;
    private static final String TCMB_URL = "https://www.tcmb.gov.tr/kurlar/today.xml";

    @PostConstruct
    public void init() {
        log.info("Initializing exchange rates...");
        if (repository.count() == 0) {
            log.info("No exchange rates found in database. Fetching initial rates...");
            updateExchangeRates();
        }
    }

    public List<ExchangeRateDTO> getAllRates() {
        List<ExchangeRateDTO> rates = repository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        log.info("Retrieved {} exchange rates", rates.size());
        return rates;
    }

    @Scheduled(cron = "0 30 * * * *") // Her saat başı 30 dakika geçe güncelle
    @Transactional
    public void updateExchangeRates() {
        try {
            log.info("Starting exchange rates update from TCMB...");
            String response = restTemplate.getForObject(TCMB_URL, String.class);
            
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse(new InputSource(new StringReader(response)));
            
            NodeList currencies = doc.getElementsByTagName("Currency");
            
            for (int i = 0; i < currencies.getLength(); i++) {
                Element currency = (Element) currencies.item(i);
                String code = currency.getAttribute("CurrencyCode");
                
                ExchangeRate existingRate = repository.findByCurrencyCode(code);
                if (existingRate != null) {
                    try {
                        String name = getElementText(currency, "Isim");
                        String forexBuyingStr = getElementText(currency, "ForexBuying");
                        String forexSellingStr = getElementText(currency, "ForexSelling");
                        
                        if (!forexBuyingStr.isEmpty() && !forexSellingStr.isEmpty()) {
                            BigDecimal forexBuying = new BigDecimal(forexBuyingStr);
                            BigDecimal forexSelling = new BigDecimal(forexSellingStr);
                            
                            // TCMB'den gelen kurları TL bazında güncelle
                            existingRate.setBuyingRate(forexBuying.setScale(4, RoundingMode.HALF_UP));
                            existingRate.setSellingRate(forexSelling.setScale(4, RoundingMode.HALF_UP));
                            existingRate.setLastUpdated(LocalDateTime.now());
                            
                            repository.save(existingRate);
                            log.info("Updated rates for {}: buying={}, selling={}", 
                                    code, forexBuying, forexSelling);
                        } else {
                            log.warn("Missing rate data for currency: {}", code);
                        }
                    } catch (Exception e) {
                        log.error("Error updating currency {}: {}", code, e.getMessage());
                    }
                }
            }
            
            log.info("Exchange rates updated successfully from TCMB");
        } catch (Exception e) {
            log.error("Error updating exchange rates from TCMB", e);
            throw new RuntimeException("Failed to update exchange rates", e);
        }
    }

    private String getElementText(Element parent, String tagName) {
        NodeList nodeList = parent.getElementsByTagName(tagName);
        if (nodeList != null && nodeList.getLength() > 0) {
            return nodeList.item(0).getTextContent().trim();
        }
        return "";
    }

    @Transactional
    public ExchangeRateDTO addCurrency(ExchangeRateDTO rateDTO) {
        log.info("Adding new currency: {}", rateDTO.getCurrencyCode());
        ExchangeRate existingRate = repository.findByCurrencyCode(rateDTO.getCurrencyCode());
        if (existingRate != null) {
            throw new RuntimeException("Currency already exists: " + rateDTO.getCurrencyCode());
        }

        ExchangeRate newRate = new ExchangeRate();
        newRate.setCurrencyCode(rateDTO.getCurrencyCode());
        newRate.setCurrencyName(rateDTO.getCurrencyName());
        newRate.setBuyingRate(BigDecimal.ZERO);
        newRate.setSellingRate(BigDecimal.ZERO);
        newRate.setLastUpdated(LocalDateTime.now());

        ExchangeRate savedRate = repository.save(newRate);
        
        // Yeni eklenen kur için hemen TCMB'den güncel değerleri al
        updateExchangeRates();
        
        // Güncellenmiş değerleri al
        ExchangeRate updatedRate = repository.findById(savedRate.getId()).orElse(savedRate);
        log.info("New currency added and updated successfully: {}", rateDTO.getCurrencyCode());
        
        return toDTO(updatedRate);
    }

    @Transactional
    public void deleteCurrency(String currencyCode) {
        log.info("Deleting currency: {}", currencyCode);
        ExchangeRate rate = repository.findByCurrencyCode(currencyCode);
        if (rate == null) {
            throw new RuntimeException("Currency not found: " + currencyCode);
        }

        repository.delete(rate);
        log.info("Currency deleted successfully: {}", currencyCode);
    }

    private ExchangeRateDTO toDTO(ExchangeRate rate) {
        ExchangeRateDTO dto = new ExchangeRateDTO();
        dto.setId(rate.getId());
        dto.setCurrencyCode(rate.getCurrencyCode());
        dto.setCurrencyName(rate.getCurrencyName());
        dto.setBuyingRate(rate.getBuyingRate());
        dto.setSellingRate(rate.getSellingRate());
        dto.setLastUpdated(rate.getLastUpdated().toString());
        return dto;
    }
} 