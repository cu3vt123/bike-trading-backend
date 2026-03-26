package com.bob.planb.entity;

import jakarta.persistence.Embeddable;
import lombok.Data;

@Embeddable
@Data
public class InspectionReport {
    private Double frameIntegrityScore;
    private String frameIntegrityLabel;

    private Double drivetrainHealthScore;
    private String drivetrainHealthLabel;

    private Double brakingSystemScore;
    private String brakingSystemLabel;
}