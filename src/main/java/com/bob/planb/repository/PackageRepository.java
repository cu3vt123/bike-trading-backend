package com.bob.planb.repository;

import com.bob.planb.entity.SubscriptionPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PackageRepository extends JpaRepository<SubscriptionPackage, Long> {
}