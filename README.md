# Cồn GIS — River Islands Research Atlas

**WebGIS tái lập chức năng và biểu diễn các kết quả đã công bố trong báo cáo khoa học** “Điều tra thực trạng, đánh giá chế độ dòng chảy, xu thế diễn biến các bãi bồi, cồn nổi ven sông và đề xuất giải pháp khai thác tổng hợp”, Viện Kỹ thuật Biển, tài liệu `2025BTE_BCTH_Connoivensong.pdf`.

**Website:** https://base27-cvnss.github.io/congis/ (bật GitHub Pages cho nhánh `main`, thư mục `/` nếu chưa được bật).

## Tính năng

- Bản đồ tương tác, bản đồ nền sáng/vệ tinh, phóng to/thu nhỏ, tỷ lệ, tọa độ chuột.
- Danh mục cồn nổi, bộ lọc, truy vấn thuộc tính, danh sách và chú giải theo mức độ diễn biến.
- Dashboard khoa học: 10 khu vực chính / 15 bãi bồi–cồn nổi; 495 loài (78 thực vật bậc cao, 142 cá, 166 thực vật phiêu sinh, 64 động vật nổi, 45 động vật đáy); những giá trị lớn nhất về bồi xói/vận tốc **được trích từ phần kết luận báo cáo**.
- Đo khoảng cách/diện tích trên ellipsoid bằng Turf; nhập GeoJSON/CSV WGS84, xuất GeoJSON/CSV; kết nối dịch vụ WMS GeoServer; bật/tắt các lớp.
- Thiết kế desktop/mobile, không cần backend, có thể chạy trên GitHub Pages.

## Giới hạn khoa học

1. **Không có dữ liệu hình học khảo sát gốc** (SHP, GeoPackage, DXF, ranh giới cồn nhiều thời kỳ, DEM, kết quả MIKE21/GeoServer) trong repo đầu tiên. Vì vậy không tuyên bố đã tái lập mô phỏng thủy động lực hay diện tích biến động.
2. **Điểm trên bản đồ mang tính gợi ý điều hướng địa danh** (ước lượng sơ đồ, KHÔNG phải tọa độ khảo sát, KHÔNG dùng để đo chiều dài/diện tích pháp lý). Không sử dụng các vị trí này cho kết luận xói lở.
3. **Số liệu báo cáo** là kết quả công bố trong tài liệu, không phải dữ liệu đo trực tuyến, không phải dự báo mới tự tính. Các trị số “gần”, “có thể đạt”, “khoảng” được giữ nguyên ngữ nghĩa.
4. Không có nội suy bản đồ các năm 2026–2030 từ vài con số kết luận. Để tái lập khoa học đầy đủ, cần GeoJSON / SHP/GeoPackage ranh giới ít nhất hai mốc thời gian, raster/DEM, WMS/WFS có quyền truy cập, cấu hình/mô hình thủy động lực và metadata CRS.

## Đối chiếu nguồn

- Báo cáo, tr. 201–210: chương WebGIS, kiến trúc QGIS 3.20.2 + GeoServer / OGC, thiết kế CSDL, 12 thành phần giao diện, các chức năng nền.
- Báo cáo, tr. 251–253: kết quả tổng kết; 10 khu vực, 15 BBCN, 495 loài; Phú Đa gần 2 m/s & xói đến 2 m/năm; cồn Lác 1,4 m/s & xói đến 1 m/năm; Tiên Lợi 1,4 m/s & xói 0,8 m/năm; khảo sát sông Mỹ Tho 0,872 m/s và sông Cổ Chiên 0,902 m/s.

## Dữ liệu đầu vào

- **GeoJSON:** `FeatureCollection` chuẩn WGS84 EPSG:4326, đặc trưng Point/LineString/Polygon.
- **CSV:** cột longitude/latitude, lon/lat, kinhdo/vido hoặc x/y (giả định WGS84, không tự suy chuyển từ VN-2000). Dấu thập phân là dấu chấm.
- **WMS:** URL GetMap của GeoServer, ví dụ `https://example.com/geoserver/wms` và `workspace:layer`. Phụ thuộc máy chủ có CORS và hỗ trợ EPSG:3857.

Ứng dụng không tự tải dữ liệu cá nhân lên máy chủ: CSV/GeoJSON được đọc trong trình duyệt; chỉ yêu cầu bản đồ nền và WMS được cấu hình tới máy chủ ngoài.

## Chạy thử

Có thể mở trực tiếp `index.html` khi có kết nối mạng cho thư viện/bản đồ nền. Khuyến nghị:
```bash
python -m http.server 8000
```
Sau đó mở http://localhost:8000.

## Trạng thái tái lập

| Thành phần | Trạng thái |
|---|---|
| WebGIS tương tác, lớp, truy vấn, tìm địa danh trong danh mục | Có |
| Đo chiều dài/diện tích, nhập dữ liệu, WMS, xuất dữ liệu | Có |
| Biểu đồ và số liệu kết luận từ báo cáo | Có nguồn |
| Bản đồ hình học khảo sát thực tế, mô hình thủy động lực | Cần dữ liệu gốc |
| Bản đồ xói bồi theo giai đoạn, kiểm chứng sai số | Cần dữ liệu gốc |

**Tái lập là tái lập chức năng và trình bày số liệu đã công bố, không thay thế kết quả GIS gốc của Viện Kỹ thuật Biển.**

Copyright © 2026 Long Ngo / Vietflexmap. Source code MIT; nguyên bản báo cáo và dữ liệu nghiên cứu thuộc về các chủ thể sở hữu tương ứng, không cấp lại giấy phép cho nội dung báo cáo.