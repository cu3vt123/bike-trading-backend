package com.minhyun.quydu_be.subscription;

import com.minhyun.quydu_be.entity.SubscriptionPlan;

/**
 * Gói đăng tin theo <strong>lượt</strong>: mỗi tin không ẩn và không ở trạng thái {@code REJECTED} tính một lượt
 * (tin bị inspector từ chối không chiếm quota).
 */
public final class SubscriptionPostingQuota {

    public static final int BASIC_POSTING_LIMIT = 3;
    public static final int VIP_POSTING_LIMIT = 20;

    private SubscriptionPostingQuota() {
    }

    public static int limitForPlan(SubscriptionPlan plan) {
        if (plan == null) {
            return 0;
        }
        return plan == SubscriptionPlan.VIP ? VIP_POSTING_LIMIT : BASIC_POSTING_LIMIT;
    }
}
