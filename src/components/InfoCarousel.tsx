import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { InfoItem } from '../pages/Home';

interface CarouselProps {
  data: InfoItem[];
}

const InfoCarousel: React.FC<CarouselProps> = ({ data }) => {
  const settings = {
    dots: true,
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    speed: 1000,
    autoplaySpeed: 3000,
    cssEase: 'linear',
  };
  return (
    <div className="slider-container mb-10 font-['TAEBAEKmilkyway']">
      <h2 className="p-5">최신의 지역 축제를 확인하세요</h2>
      <Slider {...settings}>
        {data.map((it) => (
          <div key={it.id} className="h-[560px] border-x-2 dark:border-black bg-gray-200">
            <img src={it.img} alt="" />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default InfoCarousel;
