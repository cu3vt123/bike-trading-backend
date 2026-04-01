package com.minhyun.quydu_be.dto.json;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import java.io.IOException;

/**
 * Accepts JSON number or string (FE thường gửi {@code "listingId": "5"}) cho {@link Long}.
 */
public class FlexibleLongDeserializer extends JsonDeserializer<Long> {

    @Override
    public Long deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        JsonToken t = p.currentToken();
        if (t == JsonToken.VALUE_NULL) {
            return null;
        }
        if (t == JsonToken.VALUE_NUMBER_INT || t == JsonToken.VALUE_NUMBER_FLOAT) {
            return p.getLongValue();
        }
        if (t == JsonToken.VALUE_STRING) {
            String s = p.getText().trim();
            if (s.isEmpty()) {
                return null;
            }
            try {
                return Long.parseLong(s);
            } catch (NumberFormatException e) {
                return (Long) ctxt.handleWeirdStringValue(Long.class, s, "not a valid listing id");
            }
        }
        return (Long) ctxt.handleUnexpectedToken(Long.class, p);
    }
}
