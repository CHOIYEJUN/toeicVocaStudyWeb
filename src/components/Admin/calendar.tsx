import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Box,
    Button,
    Select, useDisclosure,
    useToast,
    Text, Img
} from "@chakra-ui/react";
import React, {useEffect, useRef, useState} from "react";

import {UserData} from "../../type/UserType";
import {fetchUserDataAll} from "../../hooks/memberHook";
import {DeleteUserStemp, getuserByStemp} from "../../hooks/userStempHook";
import {forwardRef, useImperativeHandle} from "react";
import {DeleteEvent} from "../../type/SteamType";
import {Event} from "../../type/SteamType";


export const Calendar = forwardRef((props:any, ref:any) => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [events, setEvents] = useState<Event[]>([]);
    const [deleteDate, setDeleteDate] = useState<DeleteEvent>();
    const [users, setUsers] = useState<UserData[]>([]);
    const [newEvents, setNewEvents] = useState<Event[]>([]);
    const [eventImgUrl, setEventImgUrl] = useState("");
    const [user_ID, setUser_ID] = useState("0");
    const [user_name, setUser_name] = useState("");
    const [userData, setUserData] = useState({
        account: "",
        accountNumber : "",
        accountOwner : "",
        createdAt : "",
        email : "",
        uid : "",
        username : "",
    });
    const toster = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = useRef<HTMLButtonElement>(null);

    useEffect(()=> {

        const fetchAndSetUserData = async () => {
            const data: UserData[] = await fetchUserDataAll();
            setUsers(data);
        };
        fetchAndSetUserData();

    }, []);

    const onChange = (e : any) => {
        const selectedUserID = e.target.value;
        setUser_ID(selectedUserID);
        const selectedUser = users.find(user => user.uid === selectedUserID);
        if (selectedUser) {
            setUser_name(selectedUser.username);
            setUserData(selectedUser);
        }
        getEvents(e.target.value);
    }



    const getEvents = async (user_ID : string) => {
        if(user_ID === "0") {
            setEvents([]);
            return;
        }
        const stemp = await getuserByStemp(user_ID);
        const events = stemp.map((item) => {
            return {
                start: item.quest_date,
                display: "background",
                uid: item.uid,
                isSend: false,
                backgroundColor: item.quest_status === "excellent" ? "#529469" : "#b09964",
                user_name: item.user_name,
                quest_img_url : item.quest_img_url,
                quest_img_path : item.quest_img_path
            }
        })
        setEvents(events);
    }

    const titleFormat = (date : any) => {
        const year = date.date.year;
        const month = date.date.month + 1;
        return year + "년 " + month + "월";
    };

    const dateClick = (info : any) => {
        if(user_ID === "0") {
            toster({
                title: "유저를 먼저 선택해주세요",
                status: "error",
                duration: 1000,
                isClosable: true,
            });
            return false;
        }
        const clickedDate = info.dateStr;
        const isSelected = events.find((event) => event.start === clickedDate);

        if (isSelected) {
            // 이미 선택된 날짜를 다시 클릭하면 색깔 지우고 events에서 삭제
            if(isSelected.isSend) {
                setSelectedDate(null);
                setEvents(events.filter((event) => event.start !== clickedDate));
                setNewEvents(newEvents.filter((event) => event.start !== clickedDate));
            }else {
                onOpen();
                const data : DeleteEvent = {
                    start: info.dateStr,
                    uid: user_ID,
                    user_name: user_name,
                }
                setEventImgUrl(isSelected.quest_img_url)
                setDeleteDate(data);
            }
        }
    }

    const eventClicker = (info : any) => {

        onOpen();
        const data : DeleteEvent = {
            start: info.event.startStr,
            uid: info.event.extendedProps.uid,
            user_name: info.event.extendedProps.user_name,
        }
        setDeleteDate(data);

    };

    const onDeleteBtn = async () => {

        try{

            if(deleteDate === undefined) {
                toster({
                    title: "삭제할 스탬프가 없습니다.",
                    status: "error",
                    duration: 1000,
                    isClosable: true,
                });
                return;
            }
            const deleteResult = await DeleteUserStemp(deleteDate);
            if(deleteResult === "success") {
                toster({
                    title: "삭제되었습니다.",
                    status: "success",
                    duration: 1000,
                    isClosable: true,
                });
                onClose();
                getEvents(user_ID);
            }

        }catch (e){
            console.log(e);
        }


    }

    useImperativeHandle(ref, () => ({
        getChildValue: () => {
            return newEvents;
        },

        refreshCalendar: () => {
            getEvents(user_ID);
            setNewEvents([]);
        },
    }));


    return(

        <Box w={"330px"}>
            <FullCalendar
                aspectRatio={1.5}
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                weekends={true}
                height={"430px"}
                firstDay={0}
                titleFormat={titleFormat}
                headerToolbar={{
                    left: "prev",
                    center: "title",
                    right: "next",
                }}
                fixedWeekCount={false}
                dateClick={dateClick}
                events={events}
            />

            <Select
                onChange={onChange}
            >
                <option value={"0"}>유저를 선택해주세요</option>
                    {users.map((user) => {
                        return <option key={user.uid} value={user.uid} >{user.username}</option>
                    }
                )}

            </Select>

            <Box>
                <Text fontSize={"medium"}>
                     계좌 정보 : {userData.account} {userData.accountNumber} {userData.accountOwner}
                </Text>
                <Text fontSize={"medium"}>
                    이메일 : {userData.email}
                </Text>
                <Text fontSize={"medium"}>
                    가입일 : {userData.createdAt}
                </Text>
                
            </Box>

            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                            스탬프 조회
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            <Text>"{deleteDate?.start}" 에 찍힌 "{user_name}" 님의 스탬프</Text>
                            <Img
                                src={eventImgUrl}
                                maxWidth={"300px"}
                                maxHeight={"500px"}
                            />
                            
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                                Cancel
                            </Button>
                            <Button colorScheme='red' onClick={onDeleteBtn} ml={3}>
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>

        </Box>
    )

})

