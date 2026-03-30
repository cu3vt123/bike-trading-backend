package com.minhyun.quydu_be.dto.request;

public class AdminBrandRequest {
    private String name;
    private String slug;
    private Boolean active;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
