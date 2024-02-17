import {
    Button, Input,
    Modal, ModalBody, ModalCloseButton,
    ModalContent, ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
    useDisclosure,
    useToast,
    VStack
} from "@chakra-ui/react";
import {Calendar} from "../components/Admin/calendar";
import React, {forwardRef, useEffect, useRef, useState} from "react";
import {insertCheckAdminDay, insertCheckOtherDay} from "../hooks/stempHook";

export default function Admin(){


    const childComponentRef = useRef();
    const toster = useToast();
    const [passWord, setPassWord] = useState("");
    const { isOpen, onOpen, onClose } = useDisclosure()
    // 페이지 진입 시 비밀번호 체크
    useEffect(() => {
        onOpen();
    }, [])

    const onClickPageCheck = (e) => {
        const myPassWord = process.env.REACT_APP_ADMIN_PAGE_PASSWORD;
        if(myPassWord === passWord) {
            onClose();
        }else {
            toster({
                title: "오류",
                description: "비밀번호를 다시 확인해 주세요.",
                status: "error",
                isClosable: true,
            })
        }

    }

    const onChange = (e) => {
        setPassWord(e.target.value);
    }
    const onClick = async (e) => {
        let childCheckData =  childComponentRef.current.getChildValue();

        const buttonName = e.target.name;
        if(childCheckData.length === 0) {
            toster({
                title: "오류",
                description: "날짜를 선택해주세요.",
                status: "error",
                isClosable: true,
            })
            return;
        }
        await postAdminStemp(childCheckData, buttonName);
        childCheckData = [];

    }

    const postAdminStemp = async (childValue, buttonName) => {
        try{
            const promises = childValue.map(
                (item) => {
                    item.status = buttonName;
                    item.isSend ? insertCheckAdminDay(item) : Promise.resolve()
                }
            );

            const results = await Promise.all(promises);

            results.forEach((insertCheckOtherDayState, index) => {
                if (insertCheckOtherDayState === "success") {
                    console.log("성공");

                } else if(insertCheckOtherDayState === "fail") {
                    toster({
                        title: "오류",
                        description: "관리자에게 문의바랍니다.",
                        status: "error",
                        isClosable: true,
                    })
                }
            });

            toster({
                title: "성공",
                description: "완료되었습니다.",
                status: "success",
                isClosable: true,
            })

            childComponentRef.current.refreshCalendar();


        }catch (e) {
            console.log(e);
        }

    }

    return (
        <>
            <VStack
                margin={'30px 0 0 0'}
            >
                <Text
                    fontSize={'xl'}
                    fontWeight={'bold'}
                >
                    어드민 페이지
                </Text>
                <Calendar ref={childComponentRef}/>
            </VStack>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Modal Title</ModalHeader>
                    <ModalBody>
                        <Input
                            value={passWord}
                            type={"password"}
                            placeholder={"비밀번호를 입력하세요"}
                            onChange={onChange}
                        />
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme='blue' onClick={onClickPageCheck}>확인</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

        </>

    )

}
