import CalendalModal from "../components/CalendalModal";
import { useState, useCallback, ChangeEvent, useEffect } from "react";
import styled from "styled-components";
import "react-calendar/dist/Calendar.css";
import { Calendar } from "react-calendar";
import { TbArrowNarrowLeft, TbArrowNarrowRight } from "react-icons/tb";
import { AiOutlineCheckSquare } from "react-icons/ai";
import { GrMoney } from "react-icons/gr";
import { SlPlus } from "react-icons/sl";
import useToken from "../hooks/useToken";
import DayMat from "../components/DayMat";
import GlobalStyle from "./GlobalStyle";
import moment from "moment";
import "moment/locale/ko";
import axios from "axios";
import { useRouter } from "next/router";
import Image from "next/image";

interface Plans {
  id: number;
  localDate: string;
  limitMoney: number;
  totalSpentMoney: number;
  record: {
    id: number;
    memo: string;
  };
  expenditures: Expenditure[];
}

interface Expenditure {
  id: number;
  message: string;
  spentMoney: number;
}

export default function MainPage() {
  const { Tokens } = useToken();
  const [date, setDate] = useState(new Date());
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const router = useRouter();

  const [message, setMessage] = useState<string>("");
  const [spentmoney, setSpentMoney] = useState<string>("");
  const [inputBox, setInputBox] = useState(true);

  const onChangeMessage = (e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const onSetSpentMoney = (e: ChangeEvent<HTMLInputElement>) => {
    setSpentMoney(e.target.value);
  };

  const onClickToggleModal = useCallback(() => {
    setIsOpenModal(!isOpenModal);
  }, [isOpenModal]);

  const onSubmit = (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    axios
      .post(
        "/expenditures",
        {
          localDate: moment(date).format("YYYY-MM-DD"),
          message: message,
          spentMoney: Number(spentmoney),
        },
        {
          headers: {
            Authorization: Tokens,
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        console.log(res.data);
        router.push("/MainPage");
        alert("작성 완료");
      })
      .catch((err) => {
        console.log(err);
        alert("문제 발생");
      });
    setMessage("");
    setSpentMoney("");
    setInputBox(true);
  };

  // 예슬

  const [ConsumState, setConsumState] = useState<boolean>(false);
  const [consum, setConsum] = useState(0);
  const [consumColor, setConsumColor] = useState<string>("#00bf29");
  const [recordToday, setRecordToday] = useState(false);
  //토끼의 상태를 표시하기 위해 데이터 가져올때 넣을 함수
  const ConsumFace = () => {
    if (consum >= 0) {
      setConsumState(false);
    } else {
      setConsumState(true);
      setConsumColor("#ff4d35");
    }
  };

  const [budget, setBudget] = useState<string>("");
  const [memo, setMemo] = useState("");

  const [post, setPost] = useState<Plans[]>([]);

  const onChangeBudget = (e: ChangeEvent<HTMLInputElement>) => {
    setBudget(e.target.value);
  };
  const onChangeMemo = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMemo(e.target.value);
  };
  //saveDayPlan가져오기
  const onBudgetSubmit = (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(budget);
    axios
      .post(
        "/dayplans",
        {
          localDate: moment(date).format("YYYY-MM-DD"),
          limitMoney: Number(budget),
        },
        {
          headers: {
            Authorization: Tokens,
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // get 방식 하려는 부분
  useEffect(() => {
    const getPost = () => {
      axios
        .get(`/dayplans`, {
          headers: {
            Authorization: Tokens,
          },
        })
        .then((data) => {
          console.log(data.data);
          setPost(data.data);
          console.log(JSON.stringify(data.data));
        })
        .catch((e) => {
          if (Tokens === null) {
            router.push("/login");
            alert("로그인 하세요");
          }
        });
    };
    getPost();
  }, [router]);

  return (
    <>
      <GlobalStyle />
      <BugetBox>
        <p>Today&#39;s budget</p>
        <form onSubmit={onBudgetSubmit}>
          <BudgetMoney
            type="text"
            value={budget}
            onChange={onChangeBudget}
          ></BudgetMoney>
          <BudgetSub>
            <Image src="/당근.png" alt="당근" width={40} height={40}></Image>
          </BudgetSub>
        </form>
      </BugetBox>
      <BugetBox>
        <p>Today&#39;s Changes</p>
        <div>
          <p>{consum}</p>
        </div>
      </BugetBox>
      <StyledP className="text-center">
        <span className="bold"></span> {date.toDateString()}
      </StyledP>
      <StyledContainerDiv>
        <StyledCalendarDiv className="app">
          <div className="calendar-container">
            <StyledCalendar
              formatDay={(locale, date) =>
                date.toLocaleString("en", { day: "numeric" })
              }
              locale="ko"
              prevLabel={<TbArrowNarrowLeft />}
              nextLabel={<TbArrowNarrowRight />}
              next2Label={null}
              prev2Label={null}
              onChange={setDate}
              minDetail="month"
              onClickDay={onClickToggleModal}
              value={date}
              showNeighboringMonth={false}
            />
            {/* isOpenModal이 참인 경우 오른쪽을 반환 즉, Modal 컴포넌트 콜백함수 부르기 */}
            {isOpenModal && (
              <CalendalModal onClickToggleModal={onClickToggleModal}>
                <StyledDiv>
                  {month}월 {day}일 예산
                  <p>{budget}</p>
                </StyledDiv>
                <Consumlist>
                  <GrMoney />
                  Consum_List
                  <GrMoney />
                </Consumlist>
                <form onSubmit={onSubmit}>
                  <ConcumSrcBox>
                    <ConcumSrc
                      value={message}
                      onChange={onChangeMessage}
                      placeholder="사용처"
                    />
                    <ConcumSrc
                      value={spentmoney}
                      onChange={onSetSpentMoney}
                      placeholder="사용금액"
                    />
                    <ConsumSrcBtn>
                      <AiOutlineCheckSquare size={30} />
                    </ConsumSrcBtn>
                  </ConcumSrcBox>
                </form>
                <PlusBtn>
                  <SlPlus size={25} />
                </PlusBtn>
                {/* 이 부분은 CheckBox 백 데이터 받아와야되는 부분 */}
              </CalendalModal>
            )}
          </div>
        </StyledCalendarDiv>
      </StyledContainerDiv>
      <div>
        {ConsumState ? (
          <RabbitSadState color={consumColor}>
            <Image src="/sad.png" alt="마이너스" width={105} height={90} />
            <Image src="/똥.png" alt="똥" width={35} height={35}></Image>
            <p>토끼 lose 당근!</p>
            <Image src="/똥.png" alt="똥" width={35} height={35}></Image>
          </RabbitSadState>
        ) : (
          <RabbitHappyState color={consumColor}>
            <Image src="/happy1.svg" alt="마이너스" width={100} height={90} />
            <Image src="/당근.png" alt="당근" width={35} height={35}></Image>
            <p>토끼 get 당근!</p>
            <Image src="/당근.png" alt="당근" width={35} height={35}></Image>
          </RabbitHappyState>
        )}
      </div>
      <RecordRabbit>
        <RecordRabbitMmini>
          <p
            onClick={() => {
              setRecordToday((prev) => !prev);
            }}
          >
            오늘의 소비 기록하기
          </p>
        </RecordRabbitMmini>
        {recordToday && (
          <RBox>
            <RecordBox value={memo} onChange={onChangeMemo}></RecordBox>
            <RecordBtn />
          </RBox>
        )}
      </RecordRabbit>
    </>
  );
}

// 화면 2분할
const StyledContainerDiv = styled.div`
  display: flex;
`;

const StyledCalendarDiv = styled.div`
  margin: 0 auto;
  width: 36rem;
`;

const StyledP = styled.p`
  text-align: center;
  width: 14rem;
  transition: all 0.2s;
  padding: 5px;
  border-radius: 10px;
  margin: 1rem auto;
  &:hover {
    background-color: #ffcf97;
  }
`;

//todo Calendar 컴포넌트 스타일링
const StyledCalendar = styled(Calendar)`
  position: relative;
  height: 65vh;
  padding: 2rem;

  // React Calendar의 몸통 부분
  &.react-calendar {
    width: 68rem;
    max-width: 100%;
    background-color: #ffefdd;
    color: #222;
    border: none;
    border-radius: 20px;
    box-shadow: 5px 6px 10px rgba(243, 197, 99, 0.4);
    line-height: 1.125em;
  }

  // Calendar 년도, 월 선택 부분
  .react-calendar__navigation {
    display: flex;
    height: 50px;
    margin-bottom: 1.5em;
    font-size: 1rem;

    & button {
      width: 300px;
      background: none;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 1rem;
      font-weight: bolder;
      transition: all 0.2s;
      color: #111111;
    }
    & button:hover {
      background: #cadde0;
      font-size: 20px;
      color: #007e20;
      font-weight: bolder;
      transition: all 0.5s;
      cursor: pointer;
    }
  }

  // 요일 밑줄 제거
  abbr[title] {
    text-decoration: none;
    color: #f7d66d;
  }

  // 주말은 색다르게 표시
  .react-calendar__month-view__weekdays__weekday:nth-child(6) > abbr[title],
  .react-calendar__month-view__weekdays__weekday:nth-child(7) > abbr[title] {
    color: red;
  }

  .react-calendar__month-view__weekdays {
    text-align: center;
    text-transform: uppercase;
    font-weight: 400;
    font-size: 0.75em;
  }

  // calendar 날짜 선택 wrapper
  .react-calendar__viewContainer {
    padding-bottom: 20px;
  }

  // date tile 각각 설정
  .react-calendar__tile {
    max-width: 100%;
    padding: 30px;
    background: none;
    text-align: center;
    line-height: 16px;
    font-size: 12px;
    &--now {
      background: #faf2e9;
      color: #ee7834;
      &:enabled:hover,
      &:enabled:focus {
        background: #f8c499;
      }
    }
  }
`;
const PlusBtn = styled.button`
  background-color: #fff0df;
  border: none;
  outline: none;
  margin: 1rem;
  color: #ee7834;
  transition: all 0.5s ease-out;
  &:hover {
    color: #ee3a34;
    transform: translateY(-0.3rem);
  }
`;
const ConsumSrcBtn = styled.button`
  background-color: #fff0df;
  border: none;
  outline: none;
  color: #ee7834;
`;
const ConcumSrcBox = styled.div`
  display: flex;
  gap: 5px;
  margin: 1rem;
`;
const ConcumSrc = styled.input`
  width: 13rem;
  height: 3rem;
  border: none;
  outline: none;
  padding: 10px;
  font-size: 1.2rem;
  border-radius: 10px;
  &:hover {
    background-color: #ffded3;
  }
`;
const Consumlist = styled.div`
  display: flex;
  color: #ee7834;
  font-weight: bolder;
  font-size: 1.3rem;
  font-family: "Courier New", Courier, monospace;
  margin: 1rem;
  gap: 10px;
`;
const StyledDiv = styled.div`
  font-size: 24px;
  color: #ee7834;
  border-bottom: 3px solid #ee7834;
  margin: 20px auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
`;
const RecordBtn = styled.button`
  outline: none;
  border: none;
  background-color: white;
  color: #ff8c35;
`;
const RBox = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0px;
`;
const RecordBox = styled.textarea`
  width: 580px;
  height: max-content;
  background-color: #fff0df;
  box-shadow: 5px 6px 10px rgba(243, 197, 99, 0.4);
  border-radius: 20px;
  margin: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  outline: none;
  border: none;
  padding: 2rem;
  font-size: 1.2rem;
  overflow: scroll;
  &:focus {
    background-color: #fff8f0;
    transition: all 0.3s;
  }
`;
const RecordRabbitMmini = styled.div`
  width: 580px;
  height: 4rem;
  border-radius: 20px;
  background-color: #fff0df;
  box-shadow: 5px 6px 10px rgba(243, 197, 99, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
`;
const RecordRabbit = styled.div`
  margin: 1rem auto;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  font-size: 1.5rem;
  font-weight: bold;
  color: #ee7834;
  & > div {
    display: flex;
  }
  & > div > p {
    &:hover {
      color: #00bf29;
    }
  }
`;
const RabbitSadState = styled.div`
  margin: 3rem;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  font-size: 1.5rem;
  font-weight: bold;
  width: 580px;
  height: 10rem;
  border-radius: 20px;
  background-color: #fff0df;
  box-shadow: 5px 6px 10px rgba(243, 197, 99, 0.4);
  gap: 5px;
  margin: 1rem auto;
  color: #ff8c35;
  & > div {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  &:hover {
    background-color: white;
    transition: all 0.5s ease-out;
    border: 8px solid #fff0df;
  }
`;
const RabbitHappyState = styled.div`
  height: 10rem;
  border-radius: 20px;
  background-color: #fff0df;
  box-shadow: 5px 6px 10px rgba(243, 197, 99, 0.4);
  margin: 3rem;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  font-weight: bold;
  font-size: 1.5rem;
  color: #ff8c35;
  width: 580px;
  gap: 5px;
  margin: 1rem auto;
  & > div {
    display: flex;
    justify-content: center;
    align-items: center;
  }
`;
const BudgetSub = styled.button`
  background-color: white;
  outline: none;
  border: none;
`;
const BudgetMoney = styled.input`
  border: none;
  outline: none;
  font-size: 1.5rem;
  color: #00a22b;
  text-align: center;
  width: 10rem;
  border-bottom: 3px solid rgb(255, 175, 95);
  transition: all 0.5s ease-out;
  &:focus {
    border-bottom: 3px solid #00a22b;
  }
`;
const BugetBox = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  font-size: 1.5rem;
  font-family: "Courier New", Courier, monospace;
  margin: 2rem;
  & > div {
    display: flex;
    justify-content: center;
    gap: 20px;
  }
  & > p {
  }
`;
