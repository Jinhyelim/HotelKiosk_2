package hotel_kiosk.dto.customer;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OptionItemDTO {
    private int roomNo;
    private Long optionId;
    private int quantity;
    private int optionCharge;
}
