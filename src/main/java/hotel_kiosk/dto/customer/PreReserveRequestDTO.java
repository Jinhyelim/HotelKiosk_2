package hotel_kiosk.dto.customer;

import lombok.*;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PreReserveRequestDTO {
    private String memberName;
    private String memberPhone;
    private String memberBirth;
    private List<Integer> roomNos;
    private String checkinDate;
    private String checkoutDate;
    private int regPeople;
    private int addOption;
    private List<OptionItemDTO> selectedOptions; // 객실별 선택 옵션 목록
}
