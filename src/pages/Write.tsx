import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { FiMapPin } from 'react-icons/fi';
import { FaMagic, FaPlusCircle } from 'react-icons/fa';
import { CiPen, CiImageOn, CiCircleInfo } from 'react-icons/ci';
import { useParams } from 'react-router-dom';

import KakaoMap from '../components/post/KakaoMap';
import useWrite from '../Hooks/useWrite';
import usePostStore from '../store/postStore';
import useFormat from '../Hooks/useFormat';
import useUserStore from '../store/userStore';

export interface IForm {
  title: string;
  content: string;
  gatheringType: string;
  maximumParticipant: number;
  recruitmentStartDt: string;
  recruitmentEndDt: string;
  category: string;
  address: string;
  detailedAddress: string;
  lat: any;
  lng: any;
  day: string;
  time: string;
  likeCount: number;
  participantsType: string;
  fee: number;
  participantSelectionMethod: string;
  mainImg: any | null;
  subImg1: any | null;
  subImg2: any | null;
  subImg3: any | null;
}

export default function Write() {
  const { addPost, editPost } = useWrite();
  const { calculateAge } = useFormat();
  const { id }: any = useParams();

  const editData = usePostStore((state) => state.post);
  const userAge = useUserStore((state) => state.user?.birthDate);

  const getCurrentDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IForm>({
    mode: 'onChange',
    defaultValues: {
      title: '',
      category: '',
      gatheringType: 'MEETING',
      likeCount: 0,
      recruitmentStartDt: getCurrentDate(),
      recruitmentEndDt: '',
      day: '',
      time: '',
      maximumParticipant: 1,
      address: '',
      detailedAddress: '',
      lat: '',
      lng: '',
      fee: 0,
      participantSelectionMethod: 'FIRST_COME',
      participantsType: 'NO_RESTRICTIONS',
      mainImg: null,
      subImg1: null,
      subImg2: null,
      subImg3: null,
      content: '',
    },
  });

  const [daumAddress, setDaumAddress] = useState<string>('');
  const [coords, setCoords] = useState<{ lat: any; lng: any } | null>(null);
  const [images, setImages] = useState<Array<string | null>>([null, null, null, null]);
  const [imageFiles, setImageFiles] = useState<(File | null)[]>([null, null, null, null]);
  const [isEdit, setIsEdit] = useState<boolean>(false);

  /** 다음 주소찾기 API */
  const onClickAddr = () => {
    window.daum.postcode.load(() => {
      let width = 500;
      let height = 600;

      const leftOffset = (window.screen.width - width) / 2;
      const topOffset = (window.screen.height - height) / 2;

      const postcode = new window.daum.Postcode({
        width: width,
        height: height,

        oncomplete: async function (data: any) {
          console.log(data);
          setDaumAddress(data.address);

          try {
            const coords = await getAddressCoords(data.address);
            setCoords(coords);
          } catch (error) {
            console.error('Error fetching coordinates:', error);
          }
        },
      });
      postcode.open({
        autoClose: true,
        left: leftOffset,
        top: topOffset,
      });
    });
  };

  // 주소 검색후 위도 경도 찾기
  const getAddressCoords = (address: string): Promise<{ lat: number; lng: number }> => {
    const geoCoder = new kakao.maps.services.Geocoder();
    return new Promise((resolve, reject) => {
      geoCoder.addressSearch(address, (result: any, status: any) => {
        if (status === kakao.maps.services.Status.OK) {
          const lat = result[0].y;
          const lng = result[0].x;
          resolve({ lat, lng });
        } else {
          reject(status);
        }
        console.log(coords);
      });
    });
  };

  /** 날짜 유효성 검사 ( 현재보다 과거를 진행날짜로 X ) */
  const checkDate = (date: string) => {
    const today = new Date();
    const todayMillis = today.getTime();

    const isoDate = `${date}T00:00:00`;

    const selectedDate = new Date(isoDate);
    const selectedDateMillis = selectedDate.getTime();

    if (selectedDateMillis < todayMillis) {
      return true;
    } else {
      return false;
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };
  /** 이미지 추가 핸들러 */
  const handleImageChange = (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      const imageUrl = window.URL.createObjectURL(file);
      setImages((prevImageUrls) => {
        const updatedImageUrls = [...prevImageUrls];
        updatedImageUrls[index] = imageUrl;
        return updatedImageUrls;
      });

      setImageFiles((prevImageFiles) => {
        const updatedImageFiles = [...prevImageFiles];
        updatedImageFiles[index] = file;
        return updatedImageFiles;
      });
    }
  };

  /** 게시글 등록 */
  const onSubmit = (data: IForm) => {
    if (data.recruitmentEndDt < data.recruitmentStartDt) {
      alert('마감일이 시작일보다 빠를 순 없습니다.');
      scrollToTop();
    } else if (data.recruitmentEndDt >= data.day) {
      alert('모임 및 이벤트 당일이 마감일 보다 빠르거나 같을 수 없습니다.');
      scrollToTop();
    } else if (data.recruitmentStartDt > data.recruitmentEndDt) {
      alert('과거 날짜와 현재를 모집기간으로 설정할 수 없습니다.');
      scrollToTop();
    } else if (checkDate(data.day)) {
      alert('모임 및 이벤트 당일이 현재보다 과거로 설정되어있습니다.');
      scrollToTop();
    } else if (data.participantsType === 'ADULT' && calculateAge(userAge) < 19) {
      alert('미성년자가 성인 모임을 개최할 순 없습니다.');
      scrollToTop();
    } else if (data.participantsType === 'MINOR' && calculateAge(userAge) >= 19) {
      alert('성인이 미성년자 모임을 개최할 순 없습니다.');
      scrollToTop();
    } else {
      data.lat = coords?.lat || 0;
      data.lng = coords?.lng || 0;

      const jsonData: any = {
        title: data.title,
        content: data.content,
        gatheringType: data.gatheringType,
        maximumParticipant: parseInt(String(data.maximumParticipant)),
        recruitmentStartDt: data.recruitmentStartDt,
        recruitmentEndDt: data.recruitmentEndDt,
        category: data.category,
        address: data.address,
        detailedAddress: data.detailedAddress,
        lat: String(data.lat),
        lng: String(data.lng),
        day: data.day,
        time: data.time,
        participantsType: data.participantsType,
        fee: parseInt(String(data.fee)),
        participantSelectionMethod: data.participantSelectionMethod,
        likeCount: parseInt(String(data.likeCount)),
      };

      const formData = new FormData();

      if (imageFiles[0]) {
        formData.append('mainImg', imageFiles[0] as File);
      } else if (editData.mainImg) {
        formData.append('mainImg', editData.mainImg);
      }

      if (imageFiles[1]) {
        formData.append('subImg1', imageFiles[1] as File);
      } else if (editData.subImg1) {
        formData.append('subImg1', editData.subImg1);
      }

      if (imageFiles[2]) {
        formData.append('subImg2', imageFiles[2] as File);
      } else if (editData.subImg2) {
        formData.append('subImg2', editData.subImg2);
      }

      if (imageFiles[3]) {
        formData.append('subImg3', imageFiles[3] as File);
      } else if (editData.subImg3) {
        formData.append('subImg3', editData.subImg3);
      }

      if (!isEdit) {
        addPost(jsonData, formData);
      } else {
        editPost(jsonData, formData, id);
        console.log('수정된 데이터 : ', jsonData, '수정된 이미지 : ', formData);
      }
    }
  };

  useEffect(() => {
    if (id) {
      setIsEdit(true);
      setImages([editData.mainImg, editData.subImg1, editData.subImg2, editData.subImg3]);
      if (editData) {
        reset({
          title: editData.title,
          category: editData.category,
          gatheringType: editData.gatheringType,
          likeCount: editData.likeCount,
          recruitmentStartDt: editData.recruitmentStartDt,
          recruitmentEndDt: editData.recruitmentEndDt,
          day: editData.day,
          time: editData.time,
          maximumParticipant: editData.maximumParticipant,
          address: editData.address,
          detailedAddress: editData.detailedAddress,
          lat: editData.lat,
          lng: editData.lng,
          fee: editData.fee,
          participantSelectionMethod: editData.participantSelectionMethod,
          participantsType: editData.participantsType,
          mainImg: editData.mainImg,
          subImg1: editData.subImg1,
          subImg2: editData.subImg2,
          subImg3: editData.subImg3,
          content: editData.content,
        });
        setCoords({ lat: editData.lat, lng: editData.lng });
        setImages([editData.mainImg, editData.subImg1, editData.subImg2, editData.subImg3]);
        console.log(images);
        setDaumAddress(editData.address);
      }
    } else {
      console.log('id없음');
    }
  }, [id]);

  console.log(isEdit);

  return (
    <main className="py-5 font-['TAEBAEKmilkyway'] shadow-xl p-5 mb-5 mt-5 rounded-2xl dark:bg-gray-600">
      <h1 className="flex justify-center mb-10 font-['LINESeedKR-Bd'] text-2xl">
        <div className="flex justify-center items-center bg-brand_3 px-5 py-2 rounded-2xl">
          <FaMagic className="mr-3" />
          이벤트 및 모임 주최하기
        </div>
      </h1>

      <h3 className="flex mb-5 items-center space-x-2 dark:text-white">
        <CiCircleInfo />
        <span>제목과 카테고리 분류를 입력해주세요.</span>
        {errors.title && <span className="text-red-500 ssm:hidden">{errors.title.message}</span>}
        {errors.category && <span className="text-red-500 ssm:hidden">{errors.category.message}</span>}
      </h3>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* 최상단바 (제목, 카테고리 분류) */}
        <div className="flex justify-around border-2 mb-5 dark:bg-brand_2 md:text-sm ssm:justify-evenly">
          <label className="py-3 font-['LINESeedKR-Bd'] ssm:hidden" htmlFor="title">
            제목
          </label>
          <input
            className="w-2/4 placeholder:text-center p-3 outline-none text-center md:w-1/4"
            type="text"
            {...register('title', {
              required: true,
              minLength: { value: 5, message: '제목은 최소 5글자 이상 작성해주세요.' },
              maxLength: { value: 24, message: '24글자 이내로 작성해주세요.' },
            })}
            placeholder="제목을 입력하세요"
            name="title"
          />
          <label className="py-3 font-['LINESeedKR-Bd'] ssm:hidden" htmlFor="category">
            카테고리
          </label>
          <input
            className="placeholder:text-center p-3 outline-none text-center md:w-1/4"
            type="text"
            {...register('category', {
              required: true,
              minLength: { value: 2, message: '카테고리를 적어주세요 예) 독서, 산책, 운동' },
              maxLength: { value: 8, message: '카테고리는 8글자 이내로 작성해주세요.' },
            })}
            placeholder="카테고리를 적어주세요"
            name="category"
          />
          <div className="flex space-x-5 items-center">
            <label className="font-['LINESeedKR-Bd'] ssm:hidden" htmlFor="kind">
              분류를 골라주세요
            </label>
            <select
              className="outline-none bg-brand_3 p-1 rounded-xl"
              id="kind"
              {...register('gatheringType', {
                required: true,
              })}
            >
              <option value="MEETING">모임</option>
              <option value="EVENT">이벤트</option>
            </select>
          </div>
        </div>

        {/* 상단바 (썸네일, 설정작성) */}
        <h3 className="flex mt-8 items-center space-x-2 dark:text-white">
          <CiCircleInfo />
          <span>대표로 노출되는 썸네일 이미지와 설정을 입력해주세요.</span>
          {errors.maximumParticipant && (
            <p className="text-red-500 text-center ssm:hidden">{errors.maximumParticipant.message}</p>
          )}
          {errors.fee && <p className="text-red-500 text-center ssm:hidden">{errors.fee.message}</p>}
        </h3>

        <div className="flex justify-between space-x-5 mt-8 md:flex-col ml:space-x-0">
          <div className="flex justify-center items-center border-2 w-1/2 h-96 relative md:w-full">
            <label htmlFor="title_img">
              <FaPlusCircle
                className={`cursor-pointer w-12 h-12 text-brand_1
              ${images[0] ? 'absolute top-5 left-5 w-10 h-10' : 'block'}
              `}
              />
            </label>

            <input type="file" accept="image/*" id="title_img" className="hidden" onChange={handleImageChange(0)} />
            {images[0] && <img src={images[0]} className="w-full h-full object-cover" />}
          </div>

          <div className="flex-col content-center space-y-3 w-1/2 h-96 md:w-full md:h-auto md:mt-5">
            <div className="flex justify-center items-center p-2 border-2 dark:bg-gray-300 dark:border-none">
              <label htmlFor="date_st" className="mr-2 font-['LINESeedKR-Bd'] ssm:hidden">
                모집 시작일
              </label>
              <label htmlFor="date_st" className="mr-2 font-['LINESeedKR-Bd'] hidden ssm:block">
                모집
              </label>
              <input
                className="text-center px-1"
                type="date"
                id="date_st"
                {...register('recruitmentStartDt', {
                  required: true,
                })}
              />
              <label htmlFor="date_ed" className="ml-2 mr-2 font-['LINESeedKR-Bd'] ssm:hidden">
                모집 마감일
              </label>
              <label htmlFor="date_ed" className="ml-2 mr-2 font-['LINESeedKR-Bd'] hidden ssm:block">
                마감
              </label>
              <input
                className="text-center px-1"
                type="date"
                id="date_ed"
                {...register('recruitmentEndDt', {
                  required: true,
                })}
              />
            </div>

            <div className="flex justify-center items-center p-2 border-2 dark:bg-gray-300 dark:border-none">
              <label htmlFor="address" className="font-['LINESeedKR-Bd'] mr-2">
                장소
              </label>
              <input
                className="placeholder:text-center outline-none w-2/4 text-center"
                value={daumAddress}
                type="text"
                id="address"
                readOnly
                {...register('address', {
                  required: true,
                })}
                placeholder="주소를 확인하세요"
              />
              <button onClick={onClickAddr} className="bg-brand_4 px-2 ml-2 rounded-xl hover:bg-brand_3">
                주소 검색하기
              </button>
            </div>

            <div className="flex justify-center items-center p-2 border-2 dark:bg-gray-300 dark:border-none">
              <label htmlFor="time" className="font-['LINESeedKR-Bd'] mr-2">
                모임 및 이벤트 집합 시간
              </label>
              <input
                className="text-center outline-none px-1"
                type="time"
                id="time"
                {...register('time', {
                  required: true,
                })}
              />
            </div>

            <div className="flex justify-center items-center p-2 border-2 dark:bg-gray-300 dark:border-none">
              <label htmlFor="day" className="font-['LINESeedKR-Bd'] mr-2">
                모임 및 이벤트 당일
              </label>
              <input
                className="text-center outline-none px-1"
                type="date"
                id="day"
                {...register('day', {
                  required: true,
                })}
              />
            </div>

            <div className="flex justify-center items-center p-2 border-2 dark:bg-gray-300 dark:border-none">
              <label htmlFor="personnel" className="font-['LINESeedKR-Bd'] mr-2">
                모집 인원
              </label>
              <input
                className="text-center"
                type="number"
                id="personnel"
                placeholder="인원수를 지정해주세요"
                {...register('maximumParticipant', {
                  required: true,
                  min: { value: 1, message: '1명 이상은 모집해야합니다.' },
                })}
              />
              <span className="ml-2">명</span>
            </div>

            <div className="flex justify-center items-center p-2 border-2 dark:bg-gray-300 dark:border-none">
              <label htmlFor="pay" className="font-['LINESeedKR-Bd'] mr-2">
                참가 비용
              </label>
              <input
                className="text-center"
                type="number"
                placeholder="금액을 적어주세요"
                id="pay"
                {...register('fee', {
                  required: true,
                  min: { value: 0, message: '마이너스는 불가능합니다.' },
                })}
              />
              <span className="ml-2">원</span>
            </div>

            <div className="flex justify-center items-center p-2 border-2 dark:bg-gray-300 dark:border-none">
              <label htmlFor="target" className="font-['LINESeedKR-Bd'] mr-2">
                참가 제한
              </label>
              <select
                id="target"
                {...register('participantsType', {
                  required: true,
                })}
              >
                <option value="NO_RESTRICTIONS">제한없음</option>
                <option value="ADULT">성인</option>
                <option value="MINOR">미성년자</option>
              </select>
            </div>

            <div className="flex justify-center items-center p-2 border-2 dark:bg-gray-300 dark:border-none">
              <label htmlFor="method" className="font-['LINESeedKR-Bd'] mr-2">
                참가 방법
              </label>
              <select
                id="method"
                {...register('participantSelectionMethod', {
                  required: true,
                })}
              >
                <option value="FIRST_COME">선착순</option>
                <option value="UNLIMITED_APPLICATION">선별 모집</option>
              </select>
            </div>
          </div>
        </div>

        {/* 중단바 (이미지 3장) */}
        <h3 className="flex mt-5 items-center space-x-2 dark:text-white">
          <CiImageOn />
          <span>관련 이미지를 등록하여 관심도를 높이세요.</span>
        </h3>
        <div className="flex space-x-5 mt-5 md:flex-col md:space-x-0 md:space-y-5">
          {[1, 2, 3].map((index) => (
            <div key={index} className="flex justify-center items-center border-2 w-1/2 h-96 relative md:w-full">
              <label htmlFor={`sub_img${index}`}>
                <FaPlusCircle
                  className={`cursor-pointer w-12 h-12 text-brand_1 ${
                    images[index] ? 'absolute top-5 left-5 w-10 h-10' : 'block'
                  }`}
                />
              </label>
              <input
                type="file"
                id={`sub_img${index}`}
                className="hidden"
                {...register(`subImg${index}` as keyof IForm)}
                onChange={handleImageChange(index)}
              />
              {images[index] ? (
                <img src={images[index] as string} className="w-full h-full object-cover" />
              ) : (
                <div></div>
              )}
            </div>
          ))}
        </div>

        {/* 하단바 (내용 작성) */}
        <h3 className="flex mt-5 items-center space-x-2 dark:text-white">
          <CiPen />
          <span>주최하는 모임 및 이벤트 내용에 대해 설명해주세요.</span>
          {errors.content && <p className="text-red-500 ssm:ssm:hidden">{errors.content.message}</p>}
        </h3>
        <div className="border-2 mt-5 p-4 dark:bg-white dark:border-none">
          <textarea
            className="w-full outline-none min-h-40 whitespace-pre-wrap"
            id="content"
            placeholder="내용을 입력해주세요."
            {...register('content', {
              required: true,
              minLength: { value: 20, message: '최소 20글자 이상 설명해주세요.' },
            })}
          />
        </div>

        {/* 하단바 (지도맵) */}
        <h3 className="flex mt-5 items-center space-x-2 dark:text-white">
          <FiMapPin />
          <span>주소 검색으로 등록된 맵입니다.</span>
        </h3>

        {daumAddress && <KakaoMap coords={coords} />}

        <div className="flex-col bg-brand_4 items-center justify-center space-y-3 mt-5 p-5  rounded-3xl">
          <h3 className="text-center">주소 : {daumAddress}</h3>
          <div className="flex justify-center">
            <input
              type="text"
              className="w-3/4 rounded-2xl border-2 text-center p-2"
              placeholder="찾아오기 쉽게 상세주소를 더 작성해주세요."
              {...register('detailedAddress', {
                required: true,
                minLength: { value: 5, message: '5글자 이상 작성해주세요.' },
                maxLength: { value: 30, message: '30글자 이내 작성해주세요.' },
              })}
            />
          </div>
          {errors.detailedAddress && (
            <p className="text-red-500 text-center mb-5 ssm:hidden">{errors.detailedAddress.message}</p>
          )}
        </div>

        {/* 최하단바 (등록버튼) */}

        <button className="w-full mt-10 rounded-full text-center p-3 bg-brand_2 font-['LINESeedKR-Bd'] text-white text-xl hover:bg-brand_1">
          {isEdit ? '수정하기' : '게시하기'}
        </button>
      </form>
    </main>
  );
}
