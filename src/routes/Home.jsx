import {Button, Center, Text, useToast} from "@chakra-ui/react";
import {Title, Wrapper} from "../style/styles";
import {useNavigate} from "react-router-dom";
import Header from "../components/Header";
import {insertStemp} from "../hooks/stempHook";
import {useEffect, useState} from "react";
import CreateImgModal from "../components/imageModale/CreateImgModal";


export default function () {

    const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태 관리

    const navigation = useNavigate();
    const tost = useToast();
    const onClick = (e) => {
        if(e.target.name === "yes"){
            setIsModalOpen(true);
        }else if(e.target.name === "no") {
            navigation("/notyet");
        }
    }

    return (
        <>
            <Center>
                <Wrapper>
                    <Text
                        fontSize={'2xl'}
                        fontWeght={'bold'}
                    >
                        안녕하세요
                    </Text>
                    <Text
                        fontSize={'l'}
                        name={"no"}
                    >
                        오늘의 퀘스트 완료하셨나요?
                    </Text>


                    <Text
                        fontSize={'l'}
                        fontWeight={'bold'}
                    >
                    </Text>

                    <Button
                        w={'100%'}
                        margin={'10px 0 10px 0'}
                        onClick={onClick}
                        name={"yes"}
                    >
                        네 완료했어요! 😊
                    </Button>
                    <Button
                        w={'100%'}
                        margin={'0 0 10px 0'}
                        name={"no"}
                        onClick={onClick}
                    >
                        아니요 아직이요! 😢
                    </Button>

                    <CreateImgModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}/>
                </Wrapper>
            </Center>
        </>
    );
}
