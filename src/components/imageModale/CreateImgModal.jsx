import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    useToast,
    Input, ModalFooter, Button, Box
} from '@chakra-ui/react';
import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import {insertStemp} from "../../hooks/stempHook";
import {getStorage, ref, uploadBytes, getDownloadURL} from "firebase/storage";

export default function CreateImgModal ({isOpen, onClose }) {
    const [imgFile, setImgFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null); // 이미지 미리보기 URL을 위한 상태

    const toast = useToast();
    const navigation = useNavigate();


    // 이미지 파일 상태가 변경될 때마다 미리보기를 생성
    useEffect(() => {
        if (imgFile) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(imgFile);
        } else {
            setPreviewUrl(null); // 파일이 없으면 미리보기 URL을 null로 설정
        }
    }, [imgFile]);

    // 모달이 닫힐 때 상태를 초기화
    useEffect(() => {
        if (!isOpen) {
            setImgFile(null);
            setPreviewUrl(null);
        }
    }, [isOpen]);

    const todayCheck = async () => {
        if(!imgFile){
            toast({
                title: "오류",
                description: "이미지를 먼저 업로드해주세요.",
                status: "error",
                isClosable: true,
            });
            return;
        }

        const {url, imgPath} = await uploadImage(imgFile);

        if(url) {
            const insertStempState = await insertStemp(url, imgPath);

            if(insertStempState === "success"){
                navigation("/todayDoen");
            }else if(insertStempState === "fail") {
                toast({
                    title: "오류",
                    description: "관리자에게 문의바랍니다.",
                    status: "error",
                    isClosable: true,
                })
            }else if(insertStempState === "already") {
                toast({
                    title: "오류",
                    description: "이미 스탬프를 받았습니다",
                    status: "error",
                    isClosable: true,
                })
                navigation("/myState");
            }
        }else {
            toast({
                title: "오류",
                description: "이미지를 먼저 업로드해주세요.",
                status: "error",
                isClosable: true,
            });
        }
       
    }

    const onClick = () => {
        todayCheck();
    }

    // Firebase Storage에 이미지 업로드
    const uploadImage = async (file) => {
        if (!file) return;

        const storage = getStorage();
        const userId = localStorage.getItem("user_uid");
        const today = new Date().toISOString().slice(0,10);
        const imgRef = ref(storage, `QuestImage/${userId}/${today}/myImg`);

        try {
            await uploadBytes(imgRef, file);
            const url = await getDownloadURL(imgRef);
            const imgPath = imgRef.fullPath;
            return {url, imgPath};

        } catch (error) {
            console.error("Upload error:", error);
            toast({
                title: "업로드 실패",
                description: "이미지 업로드에 실패했습니다.",
                status: "error",
                isClosable: true,
            });
            return null;
        }
    };

    const onFileChange = (e) => {
        if (e.target.files[0]) {
            setImgFile(e.target.files[0]);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>사진 등록</ModalHeader>
                <ModalCloseButton />
                <ModalBody>

                    <Box
                        display={'flex'}
                        justifyContent={'center'}
                        alignItems={'center'}
                        w={"150px"}
                        h={"150px"}
                        border={"1px dashed #000"}
                        margin={"0 auto"}
                    >
                        <Input
                            type="file"
                            id="imgFile"
                            accept="image/*"
                            onChange={onFileChange}
                            opacity={0}
                            position="absolute"
                            width="60%"
                            height="60%"
                            cursor={"pointer"}
                        />
                        {previewUrl ? (
                            <Box
                                as="img"
                                src={previewUrl}
                                alt="Image preview"
                                maxWidth="100%"
                                maxHeight="100%"
                            />
                        ) : (
                            <Box textAlign={"center"}>
                                <svg style={{width: "50px", height: "50px", margin: "0 auto" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                <div className="file-upload-text">Click upload Image</div>
                            </Box>
                        )}
                    </Box>

                </ModalBody>
                <ModalFooter
                    display={'flex'}
                    justifyContent={'space-between'}
                >
                    <Button colorScheme='gray' mr={3} onClick={onClose}>
                        Close
                    </Button>
                    <Button colorScheme='blue' onClick={onClick}>등록하기</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
