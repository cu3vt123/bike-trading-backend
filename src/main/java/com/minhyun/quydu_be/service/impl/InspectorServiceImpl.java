package com.minhyun.quydu_be.service.impl;

import com.minhyun.quydu_be.dto.request.InspectorApproveRequest;
import com.minhyun.quydu_be.entity.Listing;
import com.minhyun.quydu_be.entity.ListingState;
import com.minhyun.quydu_be.exception.BadRequestException;
import com.minhyun.quydu_be.exception.ResourceNotFoundException;
import com.minhyun.quydu_be.repository.ListingRepository;
import com.minhyun.quydu_be.service.InspectorService;
import com.minhyun.quydu_be.util.ListingFieldSerializer;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InspectorServiceImpl implements InspectorService {

    private final ListingRepository listingRepository;
    private final ListingFieldSerializer listingFieldSerializer;

    public InspectorServiceImpl(ListingRepository listingRepository, ListingFieldSerializer listingFieldSerializer) {
        this.listingRepository = listingRepository;
        this.listingFieldSerializer = listingFieldSerializer;
    }

    @Override
    public List<Map<String, Object>> pendingListings() {
        return listingRepository.findByStateAndHiddenFalseOrderByUpdatedAtDesc(ListingState.PENDING_INSPECTION)
            .stream().map(this::toListingMap).collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> getListing(Long id) {
        return toListingMap(findListing(id));
    }

    @Override
    @Transactional
    public Map<String, Object> approve(Long id, InspectorApproveRequest request) {
        Listing listing = findListing(id);
        if (listing.getState() != ListingState.PENDING_INSPECTION) {
            throw new BadRequestException("Listing is not pending inspection");
        }

        listing.setInspectionResult("APPROVE");
        if (request != null && request.getInspectionReport() != null && request.getInspectionReport().isComplete()) {
            var r = request.getInspectionReport();
            double avg = (r.getFrameIntegrity().getScore() + r.getDrivetrainHealth().getScore() + r.getBrakingSystem().getScore()) / 3.0;
            listing.setInspectionScore(Math.round(avg * 10.0) / 10.0);
            Map<String, Object> reportMap = ListingFieldSerializer.buildReportMap(
                r.getFrameIntegrity().getScore(),
                r.getFrameIntegrity().getLabel() == null ? "" : r.getFrameIntegrity().getLabel(),
                r.getDrivetrainHealth().getScore(),
                r.getDrivetrainHealth().getLabel() == null ? "" : r.getDrivetrainHealth().getLabel(),
                r.getBrakingSystem().getScore(),
                r.getBrakingSystem().getLabel() == null ? "" : r.getBrakingSystem().getLabel()
            );
            listing.setInspectionReportJson(listingFieldSerializer.inspectionReportToJson(reportMap));
        } else {
            listing.setInspectionScore(listing.getInspectionScore() != null ? listing.getInspectionScore() : 4.5);
        }

        listing.setState(ListingState.AWAITING_WAREHOUSE);
        listing.setCertificationStatus("PENDING_WAREHOUSE");
        listing.setPublishedAt(null);
        listing.setListingExpiresAt(null);
        listing.setSellerShippedToWarehouseAt(null);
        listing.setWarehouseIntakeVerifiedAt(null);
        listing.setInspectionNeedUpdateReason("");
        listingRepository.save(listing);
        return toListingMap(listing);
    }

    @Override
    @Transactional
    public Map<String, Object> reject(Long id) {
        Listing listing = findListing(id);
        if (listing.getState() != ListingState.PENDING_INSPECTION) {
            throw new BadRequestException("Listing is not pending inspection");
        }
        listing.setInspectionResult("REJECT");
        listing.setState(ListingState.REJECTED);
        listing.setInspectionNeedUpdateReason("");
        listingRepository.save(listing);
        return toListingMap(listing);
    }

    @Override
    @Transactional
    public Map<String, Object> needUpdate(Long id, String reason) {
        Listing listing = findListing(id);
        if (listing.getState() != ListingState.PENDING_INSPECTION) {
            throw new BadRequestException("Listing is not pending inspection");
        }
        listing.setInspectionResult("NEED_UPDATE");
        listing.setState(ListingState.NEED_UPDATE);
        listing.setInspectionNeedUpdateReason(reason);
        listingRepository.save(listing);
        return toListingMap(listing);
    }

    private Listing findListing(Long id) {
        return listingRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Listing not found"));
    }

    private Map<String, Object> toListingMap(Listing l) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", l.getId());
        m.put("title", l.getTitle());
        m.put("brand", l.getBrand());
        m.put("model", l.getModel());
        m.put("year", l.getYear());
        m.put("frameSize", l.getFrameSize());
        m.put("price", l.getPrice());
        m.put("msrp", l.getMsrp());
        m.put("currency", l.getCurrency());
        m.put("location", l.getLocation());
        m.put("thumbnailUrl", l.getThumbnailUrl());
        m.put("imageUrls", l.getImageUrls() == null ? List.of() : l.getImageUrls());
        m.put("description", l.getDescription());
        m.put("state", l.getState().name());
        m.put("certificationStatus", l.getCertificationStatus());
        m.put("inspectionNeedUpdateReason", l.getInspectionNeedUpdateReason());
        m.put("publishedAt", l.getPublishedAt());
        m.put("listingExpiresAt", l.getListingExpiresAt());
        listingFieldSerializer.addExtendedFields(l, m);
        return m;
    }
}
