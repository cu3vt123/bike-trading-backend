package com.minhyun.quydu_be.dto.request;

public class AdminUpdateReviewRequest {
    private Integer rating;
    private String comment;
    private String status;

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
