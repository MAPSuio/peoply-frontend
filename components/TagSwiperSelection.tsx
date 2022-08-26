import React from "react";

// Swiper.
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/scrollbar";
import "swiper/css/free-mode";
import SwiperCore, { Mousewheel, FreeMode, Navigation } from "swiper";
SwiperCore.use([Mousewheel, FreeMode, Navigation]); // Install swiper modules.

import styles from "../styles/TagSwiperSelection.module.scss";
import Tag from "./Tag";

interface TagSwiperSelectionProps {
  options: {
    label: string;
    value: string;
  }[];
  selected: string;
  setSelected: (value: any) => void;
}

const TagSwiperSelection = ({
  options,
  selected,
  setSelected,
}: TagSwiperSelectionProps) => {
  return (
    <div className={styles.container}>
      <Swiper
        className={styles.mySwiper}
        mousewheel={{ forceToAxis: true }}
        slidesPerView={"auto"}
        spaceBetween={12}
        freeMode={{ enabled: true }}
      >
        {options.map(({ label, value }) => {
          return (
            <SwiperSlide key={value} className={styles.swiperSlide}>
              <Tag
                text={label}
                active={value === selected}
                onClick={() => setSelected(value)}
              />
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default TagSwiperSelection;
