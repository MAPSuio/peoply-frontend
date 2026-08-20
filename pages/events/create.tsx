// Components.
import Modal from "../../components/Modal";
import HeadComponent from "../../components/HeadComponent";
import ModalButton from "../../components/ModalButton";

import SummaryPage from "../../components/SummaryPage";

import TitleStep from "../../components/create-event/TitleStep";
import DateStep from "../../components/create-event/DateStep";
import AddressStep from "../../components/create-event/AddressStep";
import DescriptionStep from "../../components/create-event/DescriptionStep";
import ImageStep from "../../components/create-event/ImageStep";
import ExtraInfoStep from "../../components/create-event/ExtraInfoStep";

// Hooks.
import useCreateEventForm from "../../hooks/useCreateEventForm";

// Utils.
import { getInputPageData } from "../../utils/functions";

// Types.
import { InputPages, ButtonType } from "../../types/types";

// Styles.
import styles from "../../styles/CreateEvent.module.scss";

export type { EventObjectProps } from "../../hooks/useCreateEventForm";

const CreateEvent = () => {
  const {
    ipInfo,
    categories,
    eventObject,
    stepCount,
    modalOpen,
    setModalOpen,
    coOrganizerOpen,
    setCoOrganizerOpen,
    coOrganizerSearch,
    setCoOrganizerSearch,
    coOrganizerCardRef,
    coOrganizerOptions,
    visibleCoOrganizerOptions,
    selectedCoOrganizerNames,
    toggleCoOrganizerOrganization,
    validArrangersOptions,
    updateEventTitle,
    updateEventArrangerId,
    updateEventDescription,
    updateEventLocationName,
    updateEventLocation,
    updateEventCategories,
    updateEventDateStart,
    updateEventTimeStart,
    applyRecommendedStart,
    setEventHasDateEnd,
    updateEventDateEnd,
    updateEventTimeEnd,
    seteventHasRegStart,
    updateEventRegStartDate,
    updateEventRegStartTime,
    seteventHasRegEnd,
    updateEventRegEndDate,
    updateEventRegEndTime,
    updateEventImage,
    updateHasCapacity,
    updateEventCapacity,
    updateVisibility,
    updateHasFood,
    setEventHasExternalRegistration,
    updateEventExternalUrl,
    setEventHasFormQuestion,
    updateEventFormQuestion,
    inputPageOnClick,
    summaryPageOnClick,
    eventTitleValid,
    setEventTitleValid,
    eventDescriptionValid,
    setEventDescriptionValid,
    eventActiveCategoriesValid,
    setEventActiveCategoriesValid,
    eventAddressValid,
    setEventAddressValid,
    setEventImageValid,
    setEventExtraInfoValid,
    eventDateStartValid,
    eventTimeStartValid,
    eventDateEndValid,
    eventTimeEndValid,
    regStartDateValid,
    regStartTimeValid,
    regEndDateValid,
    regEndTimeValid,
    externalRegistrationUrlValid,
    validDataMap,
    summaryCategories,
    startNewEventCreation,
    continueEventCreation,
  } = useCreateEventForm();

  const getCurrentInputPage = (step: number) => {
    switch (step) {
      case 0:
        return (
          <TitleStep
            eventObject={eventObject}
            stepCount={stepCount}
            validDataMap={validDataMap}
            buttonOnClick={inputPageOnClick}
            updateEventTitle={updateEventTitle}
            eventTitleValid={eventTitleValid}
            setEventTitleValid={setEventTitleValid}
            validArrangersOptions={validArrangersOptions}
            updateEventArrangerId={updateEventArrangerId}
            coOrganizerOptions={coOrganizerOptions}
            visibleCoOrganizerOptions={visibleCoOrganizerOptions}
            selectedCoOrganizerNames={selectedCoOrganizerNames}
            coOrganizerSearch={coOrganizerSearch}
            setCoOrganizerSearch={setCoOrganizerSearch}
            coOrganizerOpen={coOrganizerOpen}
            setCoOrganizerOpen={setCoOrganizerOpen}
            coOrganizerCardRef={coOrganizerCardRef}
            toggleCoOrganizerOrganization={toggleCoOrganizerOrganization}
          />
        );
      case 1:
        return (
          <DateStep
            eventObject={eventObject}
            stepCount={stepCount}
            validDataMap={validDataMap}
            buttonOnClick={inputPageOnClick}
            applyRecommendedStart={applyRecommendedStart}
            eventDateStartValid={eventDateStartValid}
            eventTimeStartValid={eventTimeStartValid}
            eventDateEndValid={eventDateEndValid}
            eventTimeEndValid={eventTimeEndValid}
            regStartDateValid={regStartDateValid}
            regStartTimeValid={regStartTimeValid}
            regEndDateValid={regEndDateValid}
            regEndTimeValid={regEndTimeValid}
            updateEventDateStart={updateEventDateStart}
            updateEventTimeStart={updateEventTimeStart}
            setEventHasDateEnd={setEventHasDateEnd}
            updateEventDateEnd={updateEventDateEnd}
            updateEventTimeEnd={updateEventTimeEnd}
            seteventHasRegStart={seteventHasRegStart}
            updateEventRegStartDate={updateEventRegStartDate}
            updateEventRegStartTime={updateEventRegStartTime}
            seteventHasRegEnd={seteventHasRegEnd}
            updateEventRegEndDate={updateEventRegEndDate}
            updateEventRegEndTime={updateEventRegEndTime}
          />
        );
      case 2:
        return (
          <AddressStep
            eventObject={eventObject}
            stepCount={stepCount}
            validDataMap={validDataMap}
            buttonOnClick={inputPageOnClick}
            updateEventLocationName={updateEventLocationName}
            eventAddressValid={eventAddressValid}
            setEventAddressValid={setEventAddressValid}
            updateEventLocation={updateEventLocation}
            ipInfo={ipInfo}
          />
        );
      case 3:
        return (
          <DescriptionStep
            eventObject={eventObject}
            stepCount={stepCount}
            validDataMap={validDataMap}
            buttonOnClick={inputPageOnClick}
            categories={categories}
            updateEventDescription={updateEventDescription}
            eventDescriptionValid={eventDescriptionValid}
            setEventDescriptionValid={setEventDescriptionValid}
            updateEventCategories={updateEventCategories}
            eventActiveCategoriesValid={eventActiveCategoriesValid}
            setEventActiveCategoriesValid={setEventActiveCategoriesValid}
          />
        );
      case 4:
        return (
          <ImageStep
            eventObject={eventObject}
            stepCount={stepCount}
            validDataMap={validDataMap}
            buttonOnClick={inputPageOnClick}
            setEventImageValid={setEventImageValid}
            updateEventImage={updateEventImage}
          />
        );
      case 5:
        return (
          <ExtraInfoStep
            eventObject={eventObject}
            stepCount={stepCount}
            validDataMap={validDataMap}
            buttonOnClick={inputPageOnClick}
            setEventExtraInfoValid={setEventExtraInfoValid}
            updateVisibility={updateVisibility}
            updateHasCapacity={updateHasCapacity}
            updateEventCapacity={updateEventCapacity}
            updateHasFood={updateHasFood}
            setEventHasExternalRegistration={setEventHasExternalRegistration}
            updateEventExternalUrl={updateEventExternalUrl}
            externalRegistrationUrlValid={externalRegistrationUrlValid}
            setEventHasFormQuestion={setEventHasFormQuestion}
            updateEventFormQuestion={updateEventFormQuestion}
          />
        );
      case 6: {
        const { title, subTitle, buttonText } = getInputPageData(step);
        return (
          <SummaryPage
            title={title}
            subTitle={subTitle}
            currentStep={eventObject.currentStep}
            reachedStep={eventObject.reachedStep}
            stepCount={stepCount}
            buttonText={buttonText}
            validDataMap={validDataMap}
            page={InputPages.SUMMARY_PAGE}
            buttonOnClick={inputPageOnClick}
            createEventFunction={summaryPageOnClick}
            changeStep={inputPageOnClick}
            summaryCategories={summaryCategories}
            eventObject={eventObject}
            selectedCoOrganizerNames={selectedCoOrganizerNames}
          />
        );
      }
    }
  };

  return (
    <>
      <HeadComponent
        title="Nytt arrangement"
        description="Opprett et nytt arrangement på Peoply"
        path="/events/create"
      />
      <div className={styles.wrapper}>
        {modalOpen && (
          <Modal
            label="Fortsett opprettelse av arrangement?"
            description="Vi ser at du har et tidligere arrangement som ikke ble postet. Vil du fortsette der du slapp, eller opprette et nytt arrangement?"
            closeButtonOnClick={() => {
              setModalOpen(false);
              startNewEventCreation();
            }}
          >
            <ModalButton
              text="Fortsett"
              onClick={() => {
                continueEventCreation();
                setModalOpen(false);
              }}
              noShadow
            />
            <ModalButton
              text="Opprett nytt"
              onClick={() => {
                startNewEventCreation();
                setModalOpen(false);
              }}
              type={ButtonType.SECONDARY}
              noShadow
            />
          </Modal>
        )}
        <div className={styles.container}>
          {getCurrentInputPage(eventObject.currentStep)}
        </div>
      </div>
    </>
  );
};

export default CreateEvent;
