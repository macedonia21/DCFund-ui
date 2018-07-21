import React, {Component} from 'react';
import {withTracker} from 'meteor/react-meteor-data';

class RulesComp extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="row">
                <div className="col-xs-12 col-sm-12 col-md-4">
                    <p>
                        DC fund được thành lập từ <b>Jun 2012</b> với mục đích hỗ trợ phần nào cho
                        các bạn gặp khó khăn về tài chính cũng như tạo môi trường làm việc thân thiện,
                        để anh em gắn kết với nhau hơn.
                        Giá trị cao nhất của DC fund là <b>395M</b> vào <b>Oct 2017</b>.
                        Hiện tại DC fund có 34 thành viên, giá trị là <b>395M VND</b>.
                    </p>
                </div>
                <div className="col-xs-12 col-sm-12 col-md-8">
                    <p>
                        Việc tham gia DC fund là hoàn toàn tự giác, tự nguyện, bên dưới là các rules:
                    </p>
                    <p>
                        <b>Việc quản lý quỹ</b>
                    </p>
                    <ul>
                        <li>Tài khoản của quỹ được mở ở ngân hàng <b>HSBC</b>, STK: <b>091-220772-042</b>, hiện đang do
                            Hùng Tạ quản lý.
                        </li>
                        <li>Mỗi tháng, sau khi đóng sổ xong, Hùng Tạ sẽ gửi bank statement và chi tiết của quỹ đến tất
                            cả các thành viên.
                        </li>
                    </ul>
                    <p>
                        <b>Việc góp và thoái vốn</b>
                    </p>
                    <ul>
                        <li>Mỗi tháng, sau khi lãnh lương, mỗi thành viên sẽ chuyển vào tài khoản quỹ 1M.</li>
                        <li>Đến trước tết âm lịch, sẽ thoái vốn lại cho các thành viên, chỉ giữ lại 5M của mỗi thành
                            viên trong tài khoản quỹ.
                        </li>
                        <li>Khi ai đó nghỉ khỏi Deloitte, thì số tiền đóng góp sẽ được hoàn trả lại đầy đủ.</li>
                    </ul>
                    <p>
                        <b>Việc mượn và trả quỹ</b>
                    </p>
                    <ul>
                        <li>Khi ai có nhu cầu mượn quỹ, thì báo Hùng Tạ biết, không cần phải gửi email cho whole
                            group.
                        </li>
                        <li>Căn cứ vào các quy định bên dưới, Hùng Tạ sẽ chuyển quỹ cho người đó và thông báo đến tất cả
                            mọi người.
                        </li>
                        <li>Số tiền mượn nhiều nhất là 20 M, và thời gian hoàn trả lại vào kỳ lương trong tháng (ngoại
                            trừ những trường hợp chúng ta ứng tiền quỹ trước cho các social activities của công ty).
                        </li>
                        <li>Ưu tiên cho các thành viên chưa mượn quỹ mượn trước.</li>
                        <li>Nếu thành viên đã mượn quỹ ở tháng này rồi, thì:</li>
                        <ul>
                            <li>Trước ngày 10 của tháng tiếp theo, số tiền nhiều nhất thành viên này có thể mượn là
                                10M.
                            </li>
                            <li>Sau ngày 10 của tháng tiếp theo, nếu quỹ vẫn còn thì sẽ cho thành viên đó mượn tiếp 10M
                                nữa.
                            </li>
                        </ul>
                        <li>Nếu ai mượn quỹ từ ngày 20 đến ngày 28 của tháng hiện tại, thì sẽ hoàn trả lại trong tháng
                            tiếp theo, chứ không nhất thiết phải hoàn trả lại trong tháng đó vì khoản thời gian từ khi
                            mượn đến khi trả là quá ngắn.
                        </li>
                        <li>Rules trên cũng sẽ áp dụng cho tất cả các thành viên mới.</li>
                    </ul>
                </div>
            </div>
        );
    }
}

export default withTracker(() => {
    return {
        currentUser: Meteor.user()
    };
})(RulesComp);