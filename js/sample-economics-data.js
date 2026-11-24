/**
 * Sample Economics Quiz Dataset
 * Tailored for Economics Midterm Review
 */

window.QUIZ_CONFIG = {
  title: "Kinh Tế Vi Mô",
  category: "Kinh tế học",
  author: "Economics Department",
  timeLimitMinutes: 25,
  defaultQuestionTime: 25,
  passingScore: 75,
  shuffleQuestions: false,
  shuffleOptions: false
};

window.QUIZ_QUESTIONS = [
  {
    id: 1,
    type: "single",
    estimatedTime: 28,
    question: "Cho biểu cầu cá nhân về một mặt hàng: tại mức giá $P = 0$ thì lượng cầu $Q_D = 16$; tại $P = 1$ thì $Q_D = 14$; tại $P = 2$ thì $Q_D = 12$. Phương trình hàm cầu tuyến tính có dạng nào sau đây?",
    options: [
      "$Q_D = 16 + 2P$",
      "$Q_D = 16 - 2P$",
      "$Q_D = 8 - 0.5P$",
      "$Q_D = 14 - 2P$"
    ],
    correct: 1,
    explanation: "Hàm cầu tuyến tính có dạng $Q_D = a - bP$. Tại $P = 0$, $Q_D = 16 \\Rightarrow a = 16$. Khi giá $P$ tăng $1$ đơn vị (từ $0$ lên $1$), lượng cầu $Q_D$ giảm $2$ đơn vị (từ $16$ xuống $14$), do đó hệ số góc $b = -\\frac{\\Delta Q}{\\Delta P} = -\\frac{-2}{1} = 2$. Vậy phương trình hàm cầu là $Q_D = 16 - 2P$."
  },
  {
    id: 2,
    type: "single",
    estimatedTime: 21,
    question: "Theo nguyên lý thứ 3 của N. Gregory Mankiw, một người duy lý đưa ra quyết định tại điểm cận biên khi nào?",
    options: [
      "Khi tổng doanh thu của công ty đạt giá trị cực đại",
      "Khi lợi ích cận biên ($MB$) lớn hơn hoặc bằng chi phí cận biên ($MC$)",
      "Khi chi phí sản xuất bình quân giảm xuống mức thấp nhất",
      "Khi năng suất lao động bình quân tăng lên"
    ],
    correct: 1,
    explanation: "Người duy lý ra quyết định bằng cách so sánh lợi ích tăng thêm ($MB$) với chi phí tăng thêm ($MC$). Hành động chỉ được thực hiện khi $MB \\ge MC$."
  },
  {
    id: 3,
    type: "multiple",
    estimatedTime: 18,
    question: "Những yếu tố nào sau đây sẽ làm dịch chuyển đường CẦU của một hàng hóa thông thường sang PHẢI? (Chọn tất cả đáp án đúng)",
    options: [
      "Thu nhập của người tiêu dùng trong nền kinh tế tăng lên",
      "Giá của hàng hóa thay thế cho hàng hóa này tăng lên",
      "Giá của hàng hóa bổ sung cho hàng hóa này tăng lên",
      "Quy mô dân số và số lượng người tiêu dùng trên thị trường tăng",
      "Chính phủ đánh thuế vào nhà sản xuất hàng hóa đó"
    ],
    correct: [0, 1, 3],
    explanation: "Thu nhập tăng (đối với hàng thông thường), giá hàng thay thế tăng (khiến người tiêu dùng chuyển sang mua hàng này), và quy mô người mua tăng đều làm cầu tăng (dịch sang phải). Hàng bổ sung tăng giá làm cầu giảm; còn thuế đánh vào nhà sản xuất làm dịch chuyển đường cung chứ không phải đường cầu."
  },
  {
    id: 4,
    type: "multiple",
    estimatedTime: 30,
    question: "Một công ty kinh doanh 3 mặt hàng có độ co giãn của cầu theo giá: mặt hàng A ($|E_D| = 1.5$), mặt hàng B ($|E_D| = 2.5$), mặt hàng C ($|E_D| = 0.6$). Nếu mục tiêu của giám đốc là TĂNG TỔNG DOANH THU ($TR$), quyết định điều chỉnh giá nào sau đây là ĐÚNG? (Chọn tất cả đáp án đúng)",
    options: [
      "Tăng giá bán mặt hàng C",
      "Tăng giá bán đồng loạt cả 3 mặt hàng lên $10\\%$",
      "Giảm giá bán mặt hàng A",
      "Giảm giá bán mặt hàng B",
      "Tăng giá bán mặt hàng B"
    ],
    correct: [0, 2, 3],
    explanation: "Đối với mặt hàng C có cầu kém co giãn ($|E_D| = 0.6 < 1$), tăng giá sẽ làm tăng doanh thu. Đối với mặt hàng A ($|E_D| = 1.5$) và B ($|E_D| = 2.5$) có cầu co giãn ($|E_D| > 1$), giảm giá sẽ kích thích lượng bán tăng mạnh hơn mức giảm giá $(\\% \\Delta Q > \\% \\Delta P)$, giúp tăng tổng doanh thu."
  },
  {
    id: 5,
    type: "single",
    estimatedTime: 22,
    question: "Khi chính phủ ấn định giá trần có hiệu lực pháp lý ($P_{max} < P_e$) đối với thị trường xăng dầu, hiện tượng nào sau đây chắc chắn sẽ xảy ra?",
    options: [
      "Thị trường dư thừa hàng hóa vì nhà sản xuất tăng cung",
      "Thị trường thiếu hụt hàng hóa vì lượng cầu vượt quá lượng cung ($Q_D > Q_S$)",
      "Giá cả cân bằng thị trường tự động tăng lên bằng mức giá trần",
      "Tổng thặng dư xã hội đạt mức cực đại"
    ],
    correct: 1,
    explanation: "Tại mức giá trần $P_{max} < P_e$, người tiêu dùng muốn mua nhiều hơn vì giá rẻ ($Q_D$ tăng), trong khi nhà sản xuất giảm cung vì lợi nhuận thấp ($Q_S$ giảm), gây ra tình trạng thiếu hụt ($Q_D - Q_S$) và tạo ra tổn thất vô ích ($DWL$)."
  },
  {
    id: 6,
    type: "essay",
    estimatedTime: 45,
    question: "Một cử nhân quyết định dùng $200$ triệu đồng tiền tiết kiệm cá nhân để mở một hiệu sách nhỏ. Hiệu sách đem lại lợi nhuận kế toán là $5$ triệu đồng/tháng. Giả sử lãi suất gửi tiết kiệm ngân hàng là $1\\%$/tháng. Nếu đi làm cho một công ty, người này nhận mức lương $4$ triệu đồng/tháng.\n1. Hãy tính tổng chi phí cơ hội của quyết định mở hiệu sách.\n2. Đánh giá quyết định mở hiệu sách dưới góc độ kinh tế học.",
    hint: "Chi phí cơ hội gồm tiền lãi ngân hàng bị mất và tiền lương bị bỏ lỡ. Lợi nhuận kinh tế = Lợi nhuận kế toán - Chi phí cơ hội ẩn.",
    modelAnswer: "1. Chi phí cơ hội của việc mở hiệu sách gồm:\n- Tiền lãi ngân hàng bị bỏ lỡ từ khoản vốn $200$ triệu: $200 \\times 1\\% = 2$ triệu đồng/tháng.\n- Thu nhập tiền lương bỏ lỡ: $4$ triệu đồng/tháng.\n=> Tổng chi phí cơ hội = $2 + 4 = 6$ triệu đồng/tháng.\n\n2. Đánh giá kinh tế học:\n- Lợi nhuận kinh tế = Lợi nhuận kế toán - Chi phí cơ hội ẩn = $5 - 6 = -1$ triệu đồng/tháng.\n- Mặc dù sổ sách kế toán ghi nhận lãi $5$ triệu/tháng, nhưng dưới góc độ kinh tế học, chủ hiệu sách đang chịu lỗ kinh tế $1$ triệu đồng/tháng so với phương án tốt nhất bị bỏ qua (gửi tiết kiệm $2$ triệu + đi làm ngoài $4$ triệu = $6$ triệu đồng/tháng).\n=> Quyết định mở hiệu sách là chưa tối ưu về mặt kinh tế.",
    keyPoints: [
      "Tính đúng chi phí cơ hội của vốn: 2 triệu đồng/tháng.",
      "Tính đúng chi phí cơ hội của lao động/tiền lương: 4 triệu đồng/tháng.",
      "Tổng chi phí cơ hội = 6 triệu đồng/tháng.",
      "Tính được lợi nhuận kinh tế = -1 triệu đồng/tháng (âm).",
      "Kết luận quyết định mở hiệu sách chưa tối ưu về mặt kinh tế."
    ],
    explanation: "Kinh tế học luôn tính đến chi phí cơ hội (cả chi phí hiện và chi phí ẩn). Một hoạt động chỉ thực sự tạo ra giá trị kinh tế thặng dư khi lợi nhuận kế toán bù đắp được toàn bộ các cơ hội tốt nhất bị bỏ qua."
  },
  {
    id: 7,
    type: "true_false",
    estimatedTime: 24,
    question: "Xác định tính **Đúng** hoặc **Sai** cho mỗi nhận định sau về **cấu trúc thị trường** và **độ co giãn** trong kinh tế học vi mô:",
    statements: [
      {
        text: "Khi một hàng hóa có nhiều hàng hóa **thay thế gần gũi** trên thị trường, cầu về hàng hóa đó thường **co giãn nhiều** theo giá ($|E_D| > 1$).",
        correct: true
      },
      {
        text: "Trong ngắn hạn, doanh nghiệp cạnh tranh hoàn hảo sẽ quyết định **đóng cửa sản xuất** ngay khi giá thị trường $P < ATC$.",
        correct: false
      },
      {
        text: "Đường cầu dốc xuống ($P = a - bQ$) có độ co giãn theo giá là **hằng số** dọc theo toàn bộ chiều dài của đường cầu.",
        correct: false
      },
      {
        text: "Hàng hóa **thứ cấp** có độ co giãn của cầu theo thu nhập mang giá trị âm ($E_I < 0$).",
        correct: true
      }
    ],
    explanation: "**Giải thích chi tiết từng phát biểu:**\n1. **Đúng**: Càng nhiều hàng thay thế, người tiêu dùng càng dễ phản ứng chuyển sang mua mặt hàng khác khi giá tăng, khiến cầu co giãn nhiều ($|E_D| > 1$).\n2. **Sai**: Trong ngắn hạn, điều kiện đóng cửa sản xuất là khi giá rơi xuống dưới chi phí biến đổi trung bình ($P < AVC$), không phải $ATC$.\n3. **Sai**: Đường cầu tuyến tính dốc xuống có hệ số co giãn thay đổi liên tục từ co giãn nhiều ($|E_D| > 1$) ở nửa trên, co giãn đơn vị ($|E_D| = 1$) tại trung điểm, đến kém co giãn ($|E_D| < 1$) ở nửa dưới.\n4. **Đúng**: Theo định nghĩa, khi thu nhập tăng ($I \\uparrow$), lượng cầu về hàng thứ cấp giảm ($Q \\downarrow$), nên $E_I = \\frac{\\% \\Delta Q}{\\% \\Delta I} < 0$."
  }
];
