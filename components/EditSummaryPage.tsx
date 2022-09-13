// Next
import Image from "next/image";

//Types
import { Event, EventCategory, SnackTypes, Visibility } from "../types/types";

// Icons
import TitleCircle from "./TitleCircle";
import PlaceCircleSummary from "./PlaceCircleSummary";
import InfoCircleSummary from "./InfoCircleSummary";
import RadioInput from "./inputs/RadioInput";
import UnlistedIcon from "../components/svgs/UnlistedIcon";
import PublicIcon from "../components/svgs/PublicIcon";
import PrivateIconSmall from "./svgs/PrivateIconSmall";
import PublicIconSmall from "./svgs/PublicIconSmall";
import PlusIcon from "./svgs/PlusIcon";
import ImageCircleSummary from "./ImageCircleSummary";
import DataCircleSummary from "./DataCircleSummary";
import PlaceholderImage from "../assets/images/cat.jpg";
import MinusIcon from "./svgs/MinusIcon";

// Components
import SummaryCard from "./SummaryCard";
import CalendarCircleSummary from "./CalendarCircleSummary";
import TextInput from "./inputs/TextInput";
import DateInput from "./inputs/DateInput";
import TimeInput from "./inputs/TimeInput";
import CategoryInput from "./inputs/CategoryInput";
import Tag from "./Tag";
import Button from "./Button";
import ImageInput from "./inputs/ImageInput";
import TimeView from "./TimeView";
import Modal from "./Modal";
import TextInputLong from "./inputs/TextInputLong";

//Styles
import styles from "../styles/SummaryPage.module.scss";

//Hooks
import { useRouter } from "next/router";
import useSnack from "../hooks/useSnack";
import useSWR from "swr";

// Utils
import {
  removeTimezone,
  getISODateString,
  getISOTimeString,
  addTimezone,
  laterThan,
  latherThanNowISOString,
} from "../utils/functions";
import { fetchFromPeoplyApiJson } from "../services/fetchers";
import React, { ChangeEvent, useState } from "react";

function getCategories(categories: EventCategory[] | undefined) {
  if (categories === undefined) {
    return [];
  }
  return categories.map((category) => {
    return category.category.id;
  });
}

interface EditSummaryPageProps {
  event: Event;
}

interface EventObjectProps {
  visibility: Visibility;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  categoryIds: number[];
  capacity?: number | null;
  eventImage?: File;
  deleteImage: boolean;
  locationName: string;
  freeformAddress?: string;
}

const EditSummaryPage = ({ event }: EditSummaryPageProps) => {
  const [eventObject, setEventObject] = useState<EventObjectProps>({
    title: event.title,
    description: event.description,
    startDate: removeTimezone(event.startDate.toString()),
    endDate: event.endDate
      ? removeTimezone(event.endDate.toString())
      : undefined,
    categoryIds: getCategories(event.eventCategories),
    visibility: event.visibility,
    capacity: event.capacity,
    eventImage: undefined,
    deleteImage: false,
    locationName: event.locationName,
    freeformAddress: event.freeformAddress,
  });
  /*
  When editing changes are written to this state.
  The changes are written to the eventObject state when the user clicks the accept button.
  */
  const [tempEventObject, setTempEventObject] = useState<EventObjectProps>({
    ...eventObject,
  });

  const [validTitle, setValidTitle] = useState(true);
  const [validStart, setValidStart] = useState(true);
  const [validEnd, setValidEnd] = useState(true);
  const [validLocationName, setValidLocationName] = useState(true);
  const [validDescription, setValidDescription] = useState(true);
  const [validCategories, setValidCategories] = useState(true);

  const [editOpen, setEditOpen] = useState(false);
  const [changesMade, setChangesMade] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const { addSnack } = useSnack();

  /*
  update the tempEventObject state with the new value of the input.
  The input id is used as the key in the tempEventObject.
  */
  const updateTempObjectProps = (e: ChangeEvent<HTMLInputElement>) => {
    let newObjectProps: EventObjectProps;

    for (const key in tempEventObject) {
      if (key === e.target.id) {
        newObjectProps = {
          ...tempEventObject,
          [key]: e.target.value,
        };
        setTempEventObject({ ...newObjectProps });
        return;
      }
    }
  };

  function updateCategories(id: number) {
    const newCategories = [...tempEventObject.categoryIds];
    for (let i = 0; i < newCategories.length; i++) {
      if (newCategories[i] === id) {
        newCategories.splice(i, 1);
        setTempEventObject({
          ...tempEventObject,
          categoryIds: newCategories,
        });
        return;
      }
    }

    newCategories.push(id);
    setTempEventObject({
      ...tempEventObject,
      categoryIds: newCategories,
    });
  }

  const updateVisibility = (id: number) => {
    setTempEventObject({
      ...tempEventObject,
      visibility: id === 1 ? Visibility.PUBLIC : Visibility.UNLISTED,
    });
  };

  function updateStartDate(e: ChangeEvent<HTMLInputElement>) {
    const newDate = e.target.value + tempEventObject.startDate.substring(10);
    setTempEventObject({
      ...tempEventObject,
      startDate: newDate,
    });

    setValidStart(latherThanNowISOString(tempEventObject.startDate));
    setValidEnd(laterThan(tempEventObject.endDate ?? newDate, newDate));
  }

  function updateStartTime(e: ChangeEvent<HTMLInputElement>) {
    const newDate =
      tempEventObject.startDate.substring(0, 11) + e.target.value + ":00.000Z";

    setTempEventObject({
      ...tempEventObject,
      startDate: newDate,
    });

    setValidEnd(laterThan(tempEventObject.endDate ?? newDate, newDate));
  }

  function updateEndDate(e: ChangeEvent<HTMLInputElement>) {
    const newDate = e.target.value + tempEventObject.endDate?.substring(10);
    setTempEventObject({
      ...tempEventObject,
      endDate: newDate,
    });

    setValidEnd(laterThan(newDate, tempEventObject.startDate));
  }

  function updateEndTime(e: ChangeEvent<HTMLInputElement>) {
    const newDate =
      tempEventObject.endDate?.substring(0, 10) +
      "T" +
      e.target.value +
      ":00.000Z";

    setTempEventObject({
      ...tempEventObject,
      endDate: newDate,
    });

    setValidEnd(laterThan(newDate, tempEventObject.startDate));
  }

  const updateEventImage = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setTempEventObject((tempEventObject) => ({
        ...tempEventObject,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        eventImage: e.target.files[0],
        deleteImage: false,
      }));
    }
  };

  function deleteImage() {
    setTempEventObject({
      ...tempEventObject,
      eventImage: undefined,
      deleteImage: true,
    });
    event.image = undefined;
  }

  function acceptChange() {
    setChangesMade(true);
    setEventObject({ ...tempEventObject });
    setEditOpen(false);
  }
  eventObject;

  function rejectChange() {
    setTempEventObject({ ...eventObject });
    setEditOpen(false);
  }

  function setFormData(formData: FormData, eventObject: EventObjectProps) {
    for (const [key, value] of Object.entries(eventObject)) {
      if (value !== null && value !== undefined && value !== "null") {
        if (key === "startDate" || key === "endDate") {
          formData.append(key, addTimezone(value));
        } else {
          formData.set(key, value);
        }
      }
    }
    //special case where end date is removed
    if (eventObject.endDate === undefined) {
      formData.set("endDate", "");
    }
  }

  const saveChanges = async (changes: EventObjectProps) => {
    const formData = new FormData();
    setFormData(formData, changes);

    try {
      await fetchFromPeoplyApiJson(`/events/${event.id}`, {
        method: "PATCH",
        body: formData,
      });

      addSnack("Oppdatert arrangement", SnackTypes.SUCCESS);
      router.push(`/events/${event.urlId}`);
    } catch (e) {
      addSnack(
        "Det skjedde en feil under endring av arrangementet",
        SnackTypes.ERROR,
      );
    }
  };

  const deleteEvent = async () => {
    try {
      await fetchFromPeoplyApiJson(`/events/${event.id}`, {
        method: "DELETE",
      });
      addSnack("Arrangement slettet", SnackTypes.SUCCESS);
      router.push("/");
    } catch (e) {
      addSnack(
        "Det skjedde en feil under sletting av arrangementet",
        SnackTypes.ERROR,
      );
    }
  };

  const router = useRouter();
  /* Get all the possible event categories. */
  const { data: allCategories } = useSWR("/categories", fetchFromPeoplyApiJson);

  /* Get image source of either the supplied image or a placeholder. */
  const imageSource = tempEventObject.eventImage
    ? URL.createObjectURL(tempEventObject.eventImage)
    : tempEventObject.eventImage;

  const allValid =
    validTitle &&
    validStart &&
    validEnd &&
    validLocationName &&
    validDescription &&
    validCategories;
  return (
    <>
      <div className={styles.summaryContainer}>
        <SummaryCard
          inputId={0}
          Icon={<TitleCircle />}
          editButtonVisible
          editButtonDisabled={editOpen}
          onCheck={acceptChange}
          onCross={rejectChange}
          editButtonOnClick={() => setEditOpen(true)}
          valid={validTitle}
          inputComponent={
            <TextInput
              value={tempEventObject.title}
              inputId="title"
              inputName="eventTitle"
              label="Endre tittel på arrangementet"
              placeholder={tempEventObject.title}
              maxLength={100}
              minLength={3}
              errorMessage={`Tittelen må være mellom ${3} og ${100} tegn`}
              required={false}
              handleChange={updateTempObjectProps}
              setValid={setValidTitle}
              valid={validTitle}
              validate
            />
          }
        >
          <p className={styles.titleText}>{eventObject.title}</p>
        </SummaryCard>

        <SummaryCard
          onCheck={acceptChange}
          onCross={rejectChange}
          inputId={1}
          Icon={<CalendarCircleSummary />}
          editButtonVisible
          editButtonDisabled={editOpen}
          editButtonOnClick={() => setEditOpen(true)}
          valid={validStart && validEnd}
          inputComponent={
            <>
              <div
                className={`${styles.horizontalContainer} ${styles.marginBottomVerySmall} `}
              >
                <DateInput
                  value={getISODateString(tempEventObject.startDate)}
                  inputId="dateStart"
                  inputName="eventDateStart"
                  label="Dato start"
                  errorMessage="Dato må være i dag eller i fremtiden."
                  handleChange={updateStartDate}
                  valid={validStart}
                />
                <TimeInput
                  value={getISOTimeString(tempEventObject.startDate)}
                  inputId="timeStart"
                  inputName="eventTimeStart"
                  label="Tidspunkt start"
                  errorMessage="Tiden må være i fremtiden."
                  handleChange={updateStartTime}
                  valid={validStart}
                />
              </div>
              {!tempEventObject.endDate && (
                <button
                  className={styles.addDateContainer}
                  onClick={() => {
                    setTempEventObject({
                      ...tempEventObject,
                      endDate: tempEventObject.startDate,
                    });
                  }}
                >
                  <PlusIcon className={styles.addDateDimensions} />
                  <p className={styles.addDateText}>Sluttdato og -tidspunkt</p>
                </button>
              )}
              {tempEventObject.endDate && (
                <>
                  <button
                    className={styles.addDateContainer}
                    onClick={() => {
                      setTempEventObject({
                        ...tempEventObject,
                        endDate: undefined,
                      });
                      setValidEnd(true);
                    }}
                  >
                    <MinusIcon
                      className={`${styles.addDateDimensions} ${styles.marginBottomMedium}`}
                    />
                    <p className={styles.addDateText}>
                      Sluttdato og -tidspunkt
                    </p>
                  </button>
                  <div className={`${styles.horizontalContainer} `}>
                    <DateInput
                      value={
                        tempEventObject.endDate
                          ? getISODateString(tempEventObject.endDate)
                          : getISODateString(tempEventObject.startDate)
                      }
                      inputId="dateEnd"
                      inputName="eventDateEnd"
                      label="Dato slutt"
                      errorMessage="Sluttdato kan ikke være før startdato."
                      handleChange={updateEndDate}
                      valid={validEnd}
                      initiallyFocused
                    />
                    <TimeInput
                      value={
                        tempEventObject.endDate
                          ? getISOTimeString(tempEventObject.endDate)
                          : getISOTimeString(tempEventObject.startDate)
                      }
                      inputId="timeEnd"
                      inputName="eventTimeEnd"
                      label="Tidspunkt slutt"
                      errorMessage="Sluttidspunkt kan ikke være før starttidspunkt."
                      handleChange={updateEndTime}
                      valid={validEnd}
                      initiallyFocused
                    />
                  </div>
                </>
              )}
            </>
          }
        >
          <div className={`${styles.horizontalContainer}`}>
            <div className={`${styles.diagonalContainer} `}>
              <span
                className={`${styles.marginBottomVerySmall} ${styles.startAlign}`}
              >
                Start:{" "}
              </span>
              {eventObject.endDate && <span>Slutt: </span>}
            </div>

            <div className={`${styles.diagonalContainer} ${styles.startAlign}`}>
              <TimeView
                ISOtime={tempEventObject.startDate}
                styles={`${styles.marginBottomVerySmall} ${styles.dateText}`}
                localTime={false}
              ></TimeView>
              {tempEventObject.endDate && (
                <TimeView
                  ISOtime={tempEventObject.endDate}
                  styles={styles.dateText}
                  localTime={false}
                ></TimeView>
              )}
            </div>
          </div>
        </SummaryCard>

        <SummaryCard
          onCheck={acceptChange}
          onCross={rejectChange}
          editButtonOnClick={() => setEditOpen(true)}
          editButtonDisabled={editOpen}
          inputId={2}
          Icon={<PlaceCircleSummary />}
          editButtonVisible
          valid={validLocationName}
          inputComponent={
            <>
              <TextInput
                value={tempEventObject.locationName}
                inputId="locationName"
                inputName="eventLocationName"
                label="Kallenavn på stedet*"
                placeholder="F.eks. Bliss"
                maxLength={100}
                minLength={1}
                errorMessage="Du må oppgi et kallenavn på stedet."
                required
                handleChange={updateTempObjectProps}
                setValid={setValidLocationName}
                valid={validLocationName}
                validate
              />
            </>
          }
        >
          <a className={styles.placeText}>{eventObject.locationName}</a>
        </SummaryCard>

        <SummaryCard
          onCheck={acceptChange}
          onCross={rejectChange}
          editButtonOnClick={() => setEditOpen(true)}
          editButtonDisabled={editOpen}
          inputId={3}
          Icon={<InfoCircleSummary />}
          editButtonVisible
          valid={validDescription}
          inputComponent={
            <>
              <TextInputLong
                value={tempEventObject.description}
                inputId="description"
                inputName="eventTitle"
                label="Endre beskrivelse av arrangementet"
                placeholder={tempEventObject.description}
                maxLength={2500}
                errorMessage="Beskrivelsen kan ikke være tom"
                required={false}
                handleChange={updateTempObjectProps}
                setValid={setValidDescription}
                valid={validDescription}
                validate
              />
            </>
          }
        >
          <div className={styles.descriptionText}>
            {tempEventObject.description}
          </div>
        </SummaryCard>

        <SummaryCard
          onCheck={acceptChange}
          onCross={rejectChange}
          editButtonOnClick={() => setEditOpen(true)}
          editButtonDisabled={editOpen}
          inputId={4}
          Icon={<InfoCircleSummary />}
          editButtonVisible
          valid={validCategories}
          inputComponent={
            <CategoryInput
              categories={allCategories}
              activeCategories={tempEventObject.categoryIds}
              errorMessage="Du må velge minst en kategori."
              onClick={updateCategories}
              style={styles.categoryTag}
              setValid={setValidCategories}
              valid={validCategories}
            />
          }
        >
          <div className={styles.categoryContainer}>
            <p className={styles.categoryLabel}>Kategori(er)</p>
            <div className={styles.categoryTagsContainer}>
              {tempEventObject.categoryIds !== undefined &&
                tempEventObject.categoryIds.map((categoryId) => {
                  return (
                    <Tag
                      key={categoryId}
                      text={
                        allCategories !== undefined
                          ? allCategories[categoryId - 1].name
                          : "..."
                      }
                      active={true}
                    />
                  );
                })}
            </div>
          </div>
        </SummaryCard>

        <SummaryCard
          onCheck={acceptChange}
          onCross={rejectChange}
          editButtonOnClick={() => setEditOpen(true)}
          editButtonDisabled={editOpen}
          inputId={5}
          Icon={<ImageCircleSummary />}
          editButtonVisible
          inputComponent={
            <>
              <ImageInput
                value={tempEventObject.eventImage}
                placeholder={event.image}
                inputId="image"
                inputName="eventImage"
                label="Last opp et bilde til arrangementet"
                buttonLabel="Endre bilde"
                errorMessage="Bildet kan ikke være så stort."
                onChange={updateEventImage}
              />
              <a className={styles.deleteImage} onClick={deleteImage}>
                Slett bilde
              </a>
            </>
          }
        >
          <div className={styles.imageContainer}>
            <Image
              src={imageSource ?? event.image ?? PlaceholderImage}
              layout="fill"
              alt="Bilde for arrangementet"
              objectFit="cover"
              objectPosition="center"
            />
          </div>
        </SummaryCard>

        <SummaryCard
          onCheck={acceptChange}
          onCross={rejectChange}
          editButtonOnClick={() => setEditOpen(true)}
          editButtonDisabled={editOpen}
          inputId={6}
          Icon={<DataCircleSummary />}
          editButtonVisible
          inputComponent={
            <>
              <RadioInput
                optionsAndIcons={[
                  {
                    id: 1,
                    text: "offentlig",
                    hintText:
                      "Synlig for offentligheten. Vises for alle i appen, inkludert personer uten brukerkonto.",
                    icon: PublicIcon,
                    active: tempEventObject.visibility === Visibility.PUBLIC,
                  },
                  {
                    id: 2,
                    text: "ikke oppført",
                    hintText:
                      "Ikke synlig for offentligheten, men alle med lenken kan se arrangementet, inkludert personer uten brukerkonto.",
                    icon: UnlistedIcon,
                    active: tempEventObject.visibility === Visibility.UNLISTED,
                  },
                ]}
                onClick={updateVisibility}
                label="Privat eller ikke oppført arrangement?*"
              />
            </>
          }
        >
          <div className={styles.dataContainer}>
            {eventObject.visibility === Visibility.UNLISTED ? (
              <div className={styles.dataItemContainer}>
                <PrivateIconSmall className={styles.dataIconDimensions} />{" "}
                <p className={styles.dataLabel}>Ikke oppført</p>
              </div>
            ) : eventObject.visibility === Visibility.PUBLIC ? (
              <div className={styles.dataItemContainer}>
                <PublicIconSmall className={styles.dataIconDimensions} />
                <p className={styles.dataLabel}>Offentlig</p>
              </div>
            ) : (
              <>{/* TODO: implement Private */}</>
            )}
          </div>
        </SummaryCard>

        <Button
          text={"Lagre endringer"}
          onClick={() => saveChanges(eventObject)}
          disabled={!changesMade || editOpen || !allValid}
        ></Button>

        <button
          className={styles.deleteButton}
          onClick={() => {
            setDeleteModalOpen(true);
          }}
        >
          Slett arrangementet
        </button>
        {deleteModalOpen && (
          <Modal
            label="Slette arrangement"
            description="Er du sikker på at du vil slette arrangementet?"
            buttonText="Slett"
            buttonOnClick={deleteEvent}
            secondaryButtonText="Avbryt"
            secondaryButtonOnClick={() => {
              setDeleteModalOpen(false);
            }}
            closeButtonOnClick={() => {
              setDeleteModalOpen(false);
            }}
          ></Modal>
        )}
      </div>
    </>
  );
};

export default EditSummaryPage;
