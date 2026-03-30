## Mã Jira
- Liên kết: [SHOP-XXX](https://group1-swp.atlassian.net/jira/software/projects/SHOP/list?jql=project%20%3D%20SHOP%20ORDER%20BY%20created%20DESC)

## Mô tả thay đổi
- 
-

## Screenshots (nếu có)


## Checklist trước khi nhờ review
- [ ] Code đã tự build và chạy ổn định ở Local (`npm run lint`, `npm run build` — xem [README.md](../README.md)).
- [ ] Đã test thành công trên Postman/Swagger (nếu đổi API).
- [ ] Nếu thêm/sửa luồng server state: đã xem [docs/FE-ARCHITECTURE-V1-VS-V2.md](../docs/FE-ARCHITECTURE-V1-VS-V2.md) (invalidate `queryKeys` sau mutation).
- [ ] Đã xóa code rác (System.out.println, `console.log` tạm, comment thừa…).
- [ ] Không có conflict với nhánh chính.
- [ ] Nếu đổi tài liệu: cập nhật [docs/CHANGELOG.md](../docs/CHANGELOG.md) (một dòng là đủ).
