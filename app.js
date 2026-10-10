/* N2D — interactive nail booking validation prototype.
   All data is local demo data except the confirmed N2D brand, location, hours and service details.
   There is intentionally no backend, Instagram integration, or production integration. */

const STORAGE_KEY = "n2d-salon-prototype-v4";
const LANGUAGE_KEY = "n2d-salon-language";
const STAFF_LANGUAGE_KEY = "n2d-staff-language";
// Customer UI: Czech + English only. Staff/admin UI: Czech + Vietnamese only.
// These are two independent language choices, stored under separate keys, so
// switching language in one mode never reads or writes the other mode's state.
const MODE_LANGUAGES = { customer: ["cs", "en"], staff: ["cs", "vi"] };

const STRINGS = {
  cs: {
    pageTitle: "N2D — Rezervace v salonu",
    demoNotice: "Interaktivní ukázka — jména, služby a kalendář jsou vzorové",
    resetDemo: "Obnovit ukázku",
    brandTagline: "rezervace v salonu",
    clientBooking: "Rezervace",
    staffCalendar: "Kalendář salonu",
    savedLocally: "Uloženo v tomto zařízení",
    languageLabel: "Jazyk",
    notebookHome: "Domovská stránka N2D",
    book: "Objednat se",
    schedule: "Kalendář",
    add: "Přidat",
    setup: "Nastavení",
    clientView: "Pro klienty",
    chooseSalon: "Vyberte salon",
    chooseService: "Vyberte službu",
    chooseTime: "Vyberte termín",
    yourDetails: "Vaše údaje",
    review: "Kontrola",
    confirmed: "Potvrzeno",
    bookYourAppointment: "Rezervujte si termín",
    aLittleTime: "Chvilka<br>pro vás.",
    chooseSalonStart: "Nejprve vyberte salon.",
    chooseASalon: "Vyberte salon",
    locationSoon: "Adresa bude doplněna",
    chooseSalonAria: "Vybrat {salon}",
    whatWouldYouLike: "Jakou službu si přejete?",
    chooseServiceHint: "Vyberte službu a zobrazíme volné termíny.",
    serviceAria: "{group}, {name}, {duration} minut",
    whenSuits: "Kdy se vám to hodí?",
    minutesAtSalon: "{duration} minut · {salon}",
    change: "Změnit",
    unavailable: "Nedostupné",
    full: "Obsazeno",
    selectDay: "Vyberte den",
    bookAt: "Rezervovat v {time}",
    noOnlineTimes: "Na tento den nejsou online termíny.",
    chooseAnotherDate: "Vyberte jiný den.",
    noTimesFit: "V tento den není pro tuto službu volný termín.",
    tryAnotherDateService: "Zkuste jiný den nebo službu.",
    almostThere: "Ještě pár údajů",
    howReachYou: "Jak vás můžeme kontaktovat?",
    detailsHint: "Stačí údaje potřebné k rezervaci.",
    yourName: "Jméno",
    bestContact: "Preferovaný kontakt",
    phone: "Telefon",
    instagram: "Instagram",
    phoneNumber: "Telefonní číslo",
    instagramUsername: "Uživatelské jméno na Instagramu (nepovinné)",
    appointmentReminder: "Připomenutí termínu",
    requestReminder: "Přeji si připomenutí před návštěvou.",
    reminderAria: "Požádat o připomenutí termínu",
    notesLabel: "Poznámka (nepovinné)",
    notesPlaceholder: "Např. co si přejete nebo s kým byste chtěla rezervaci.",
    notes: "Poznámka",
    photoLabel: "Referenční fotka (nepovinné)",
    photoHint: "Přiložte inspiraci pro nehty — JPG, PNG nebo WebP, max. 1 fotka.",
    photo: "Fotka",
    addPhoto: "Přidat fotku",
    removePhoto: "Odebrat fotku",
    photoAlt: "Referenční fotka nehtů",
    photoInvalidType: "Nahrajte prosím JPG, PNG nebo WebP soubor.",
    photoTooLarge: "Soubor je příliš velký (max. 15 MB).",
    viewPhoto: "Zobrazit fotku na celou obrazovku",
    reviewBooking: "Zkontrolovat rezervaci",
    everythingRight: "Sedí všechno?",
    checkDetails: "Před potvrzením zkontrolujte údaje.",
    salon: "Salon",
    service: "Služba",
    date: "Datum",
    time: "Čas",
    contact: "Kontakt",
    reminder: "Připomenutí",
    on: "Zapnuto",
    off: "Vypnuto",
    confirmAppointment: "Potvrdit rezervaci",
    backAndEdit: "Zpět a upravit",
    bookingConfirmed: "Rezervace potvrzena",
    youreBooked: "Máte rezervováno.",
    appointmentDetailsBelow: "Podrobnosti rezervace najdete níže.",
    bookAnother: "Rezervovat další termín",
    staffNotebook: "Pro salon N2D",
    staffLoginTitle: "Přihlášení pro personál",
    staffLoginHint: "Přístup do kalendáře salonu je pouze pro vedoucí provozu.",
    staffEmail: "E-mail",
    staffPassword: "Heslo",
    staffSignIn: "Přihlásit se",
    staffSigningIn: "Přihlašování…",
    staffCheckingSession: "Ověřujeme přihlášení…",
    staffLoginRequired: "Zadejte e-mail a heslo",
    staffLoginFailed: "Přihlášení se nezdařilo. Zkontrolujte e-mail a heslo.",
    staffAccessDeniedTitle: "Přístup nepovolen",
    staffAccessDeniedText: "Tento účet není nastaven jako vedoucí provozu, a proto nemá přístup do kalendáře salonu.",
    staffSignOut: "Odhlásit se",
    staffLoadingSchedule: "Načítáme kalendář salonu…",
    staffLoadError: "Kalendář se nepodařilo načíst. Zkontrolujte připojení a zkuste to znovu.",
    staffActionFailed: "Akci se nepodařilo dokončit. Zkontrolujte připojení a zkuste to znovu.",
    staffWorking: "Ukládáme…",
    savedToServer: "Uloženo",
    blockTime: "Blokovat čas",
    todayDay: "Den",
    week: "Týden",
    calendar: "Měsíc",
    weekOf: "Týden od {date}",
    today: "Dnes",
    goToday: "Přejít na dnešek",
    previous: "Předchozí",
    next: "Další",
    hoursTbd: "Otevírací doba neurčena",
    capacityCount: "Kapacita {count}",
    adjustDay: "Upravit den",
    calendarCapacity: "Kapacita: {count}",
    appointmentAria: "{start} až {end}, {name}, {service}",
    blockedAria: "Blokováno, {reason}, {start} až {end}",
    noBookingsYet: "Zatím bez rezervací",
    dayOpenAvailable: "Den je volný.",
    noWorkingHours: "Bez pracovní doby",
    setHoursHint: "Nastavte hodiny, aby bylo možné tento den rezervovat.",
    setHours: "Nastavit hodiny",
    noBookings: "Bez rezervací",
    hoursNotConfigured: "Pracovní doba není nastavena",
    salonSettings: "Nastavení salonu",
    setupDescription: "Služby, pracovní doba a denní dostupnost.",
    beforeLive: "Před spuštěním",
    beforeLiveText: "Potvrďte pracovní dobu, víkendový provoz a konečný seznam služeb. Kapacita určuje, kolik rezervací může salon přijmout současně. Automatická připomenutí zatím nejsou aktivní.",
    servicesDuration: "Služby a délka",
    durationDetermines: "Délka služby určuje, které termíny si klient může rezervovat.",
    addService: "Přidat službu",
    availableToBook: "Aktivní",
    inactive: "Neaktivní",
    weeklyHours: "Týdenní pracovní doba",
    forSalon: "Pro {salon}.",
    workingHours: "Pracovní doba",
    notConfiguredTbd: "Nenastaveno",
    tbd: "Neurčeno",
    selectedDay: "Vybraný den",
    edit: "Upravit",
    hours: "Hodiny",
    bookings: "Rezervace",
    blocks: "Blokace",
    appointmentDetail: "Detail rezervace",
    appointment: "Rezervace",
    bookingNotFound: "Rezervace nebyla nalezena",
    blockNotFound: "Blokace nebyla nalezena",
    notProvided: "Neuvedeno",
    sendingNotConnected: "Automatická připomenutí zatím nejsou aktivní",
    source: "Zdroj",
    editDetails: "Upravit údaje",
    saveDetails: "Uložit údaje",
    reschedule: "Přesunout",
    cancelBooking: "Zrušit rezervaci",
    close: "Zavřít",
    cancelQuestion: "Zrušit rezervaci?",
    cancelExplanation: "Rezervace zmizí z aktivního kalendáře. Termín {date} v {start}–{end} se ihned uvolní pro další klientku.",
    keepBooking: "Ponechat rezervaci",
    cancelRelease: "Zrušit a uvolnit termín",
    originalHeld: "Původní termín zůstane rezervovaný, dokud změnu neuložíte. Zobrazují se jen termíny, do kterých se vejde celých {duration} minut.",
    newDate: "Nové datum",
    availableStart: "Volný začátek",
    noValidSlots: "V tento den není volný termín o délce {duration} minut.",
    cancel: "Zrušit",
    saveNewTime: "Uložit nový termín",
    addBooking: "Přidat rezervaci",
    manualEntry: "Ruční zadání",
    manualNote: "Pro rezervace z telefonu, Instagramu nebo pro klientky bez online rezervace. Platí stejná pravidla kapacity.",
    startTime: "Začátek",
    selectTime: "Vyberte čas",
    clientName: "Jméno klientky",
    phoneOrInstagram: "Telefon nebo Instagram",
    reminderEnabled: "Připomenutí zapnuto",
    addToCalendar: "Přidat do kalendáře",
    editNote: "Zde upravíte kontakt a připomenutí. Pro změnu termínu použijte Přesunout.",
    contactType: "Typ kontaktu",
    blockUnavailable: "Blokovat nedostupný čas",
    availability: "Dostupnost",
    blockNote: "Plná blokace využije celou kapacitu. Částečná blokace označí jednu osobu jako nedostupnou. Stávající rezervace zůstanou beze změny.",
    from: "Od",
    until: "Do",
    capacityToBlock: "Blokovaná kapacita",
    capacityOf: "{used} z {total}",
    reason: "Důvod",
    breakReason: "Pauza",
    unavailableTime: "Nedostupný čas",
    capacityUsed: "Využitá kapacita",
    removeBlock: "Odstranit blokaci",
    adjustThisDay: "Upravit tento den",
    daySettingsNote: "Nastavení platí jen pro tento den. Kapacita určuje počet současných rezervací. Při snížení kapacity zůstanou stávající rezervace beze změny.",
    hoursConfigured: "Pracovní doba nastavena",
    turnOffTbd: "Vypnutím označíte den jako neurčený.",
    open: "Otevřeno",
    closeTime: "Zavřeno",
    capacity: "Kapacita",
    capacityOne: "1 rezervace současně",
    capacityMany: "{count} rezervace současně",
    saveDay: "Uložit den",
    addServiceTitle: "Přidat službu",
    editService: "Upravit službu",
    servicesAndDuration: "Služby a délka",
    serviceChangeNote: "Změny platí pro nové rezervace. Stávajícím rezervacím zůstane původní délka i při přesunu.",
    serviceType: "Typ služby",
    variantOption: "Varianta / možnost",
    duration: "Délka",
    minutes: "{count} minut",
    activeForBooking: "Aktivní pro rezervace",
    inactiveExisting: "Neaktivní služby zůstanou u stávajících rezervací.",
    saveService: "Uložit službu",
    weeklyHoursTitle: "Týdenní pracovní doba",
    hoursNote: "Nastavte běžnou pracovní dobu pro tento den. Bez nastavení se den zobrazí jako neurčený.",
    allowBookingWeekday: "Povolit klientům rezervace v tento den.",
    saveHours: "Uložit pracovní dobu",
    closeDialog: "Zavřít dialog",
    sourceDemo: "Ukázková data",
    sourceClient: "Online rezervace",
    sourceStaff: "Přidáno personálem",
    resetConfirm: "Obnovit původní ukázkový kalendář a odstranit všechny místní změny?",
    demoRestored: "Ukázková data byla obnovena",
    requiredContact: "Doplňte jméno a kontakt",
    invalidName: "Zadejte prosím platné jméno (písmena, ne jen čísla nebo symboly).",
    invalidPhone: "Zadejte prosím platné telefonní číslo.",
    invalidInstagram: "Zadejte prosím platné uživatelské jméno na Instagramu.",
    slotUnavailable: "Tento termín už není volný. Vyberte jiný.",
    checkingAvailability: "Zjišťujeme…",
    checkFailed: "Nelze zjistit",
    loadingCatalog: "Načítáme nabídku salonu…",
    catalogLoadError: "Nabídku se nepodařilo načíst. Zkontrolujte připojení a zkuste to znovu.",
    retry: "Zkusit znovu",
    loadingTimes: "Načítáme volné termíny…",
    availabilityLoadError: "Termíny se nepodařilo načíst.",
    bookingNetworkError: "Rezervaci se nepodařilo odeslat. Zkontrolujte připojení k internetu a zkuste to znovu.",
    photoUploadError: "Fotku se nepodařilo nahrát. Zkuste to prosím znovu, nebo pokračujte bez fotky.",
    photoLabelRequired: "Referenční fotka (povinné)",
    photoRequiredMessage: "Pro pokračování nahrajte referenční fotku.",
    photoUploadErrorRequired: "Fotku se nepodařilo nahrát. Zkuste to prosím znovu.",
    submittingBooking: "Odesíláme rezervaci…",
    manualRequired: "Doplňte jméno klientky, kontakt a volný termín",
    timeNoLongerAvailable: "Tento termín už není volný",
    bookingAdded: "Rezervace byla přidána do kalendáře",
    timeAvailableAgain: "Termín {start}–{end} je znovu volný",
    chooseAvailableTime: "Vyberte volný termín",
    movedReleased: "Rezervace přesunuta z {old}; původní termín je volný",
    detailsUpdated: "Údaje rezervace byly upraveny",
    nameContactRequired: "Jméno a kontakt jsou povinné",
    endAfterStart: "Čas konce musí být po začátku",
    blockedSuccess: "Nedostupný čas byl zablokován",
    blockRemoved: "Blokace byla odstraněna; kapacita je znovu volná",
    dailyUpdated: "Denní dostupnost byla upravena",
    serviceNameRequired: "Doplňte typ a variantu služby",
    serviceSaved: "Služba byla uložena",
    closingAfterOpening: "Zavírací doba musí být po otevírací",
    weeklyUpdated: "Týdenní pracovní doba byla upravena",
    placeholderName: "Jméno",
    placeholderServiceType: "např. Nová modeláž",
    placeholderVariant: "např. S designem",
    placeholderContact: "@uživatelskéjméno nebo telefon",
    addressPlaceholder: "Adresa bude doplněna",
    serviceGroupRefill: "Doplnění",
    serviceGroupNewSet: "Nová modeláž",
    serviceGroupLashes: "Řasy",
    serviceGroupPedicure: "Pedikúra",
    serviceVariantBasic: "Základní / bez zdobení",
    serviceVariantDesign: "Se zdobením",
    serviceVariantLashSet: "Sada řas",
    serviceVariantPedicure: "Klasická",
    priceFrom: "od {price} Kč",
    priceExact: "{price} Kč",
    addOnsSectionTitle: "Zdobení (volitelné)",
    addOnsHint: "Lze přidat k této službě. Některé varianty prodlouží rezervaci o uvedený čas.",
    continueWithSelection: "Pokračovat",
    servicePrice: "Cena služby",
    addOnsChosen: "Vybrané zdobení",
    addOnsTotal: "Zdobení celkem",
    totalPrice: "Celkem",
    noAddOns: "Bez zdobení",
    lengthSectionTitle: "Délka nehtů",
    lengthHint: "Vyberte délku, než přidáte zdobení.",
    lengthShort: "Krátké",
    lengthMedium: "Střední",
    lengthLong: "Dlouhé",
    lengthExtraLong: "Extra dlouhé",
    length: "Délka",
    manualLengthRequired: "Nejprve vyberte délku nehtů — pak uvidíte volné časy.",
    designModeSectionTitle: "Chcete zdobení?",
    designModeHint: "Vyberte jednu z možností, než budete pokračovat.",
    designModeNone: "Bez zdobení",
    designModeNoneHint: "Jen zvolená délka, bez designu.",
    designModeDesign: "Zdobení",
    designModeDesignHint: "Vyberte si z nabídky zdobení.",
    designModeCombo: "Zdobení + inspirace",
    designModeComboHint: "Vyberte zdobení a přiložte inspirační fotku.",
    // Phase 3C — customer self-cancellation (cs). Customer UI only; not added
    // to the vi (staff/admin) block, which is out of scope for this phase.
    haveBookingCancelIt: "Máte rezervaci? Zrušit ji",
    cancelLookupTitle: "Zrušit rezervaci",
    cancelLookupHint: "Zadejte číslo rezervace a telefon, který jste uvedli při objednání.",
    bookingReference: "Číslo rezervace",
    bookingReferencePlaceholder: "Vložte číslo rezervace",
    submitCancelBooking: "Zrušit rezervaci",
    cancelLookupWorking: "Rušíme rezervaci…",
    cancelLookupNotFound: "Nenašli jsme rezervaci s tímto číslem a telefonním číslem.",
    cancelLookupAlreadyCancelled: "Tato rezervace už byla zrušena.",
    cancelLookupWindowClosed: "Rezervaci lze zrušit jen do 2 hodin před termínem. Kontaktujte prosím přímo salon.",
    cancelLookupSuccessTitle: "Rezervace zrušena",
    cancelLookupSuccessBody: "Vaše rezervace byla zrušena.",
    cancelLookupBack: "Zpět na rezervaci",
  },
  en: {
    pageTitle: "N2D — Salon appointments", demoNotice: "Interactive demo — sample names, services & schedule", resetDemo: "Reset demo", brandTagline: "salon appointments", clientBooking: "Client booking", staffCalendar: "Staff calendar", savedLocally: "Saved locally", languageLabel: "Language", notebookHome: "N2D home", book: "Book", schedule: "Schedule", add: "Add", setup: "Setup", clientView: "Client view",
    chooseSalon: "Choose salon", chooseService: "Choose service", chooseTime: "Choose a time", yourDetails: "Your details", review: "Review", confirmed: "Confirmed", bookYourAppointment: "Book your appointment", aLittleTime: "A little time<br>for you.", chooseSalonStart: "Choose your salon to get started.", chooseASalon: "Choose a salon", locationSoon: "Location details coming soon", chooseSalonAria: "Choose {salon}", whatWouldYouLike: "What would you like?", chooseServiceHint: "Choose a service to see times that fit.", serviceAria: "{group}, {name}, {duration} minutes", whenSuits: "When suits you?", minutesAtSalon: "{duration} minutes · {salon}", change: "Change", unavailable: "Unavailable", full: "Full", selectDay: "Select a day", bookAt: "Book at {time}", noOnlineTimes: "No online times this day.", chooseAnotherDate: "Choose another date.", noTimesFit: "No times fit this service on this day.", tryAnotherDateService: "Try another date or service.", almostThere: "Almost there", howReachYou: "How can we reach you?", detailsHint: "Only the details the salon needs for this appointment.", yourName: "Your name", bestContact: "Best contact", phone: "Phone", instagram: "Instagram", phoneNumber: "Phone number", instagramUsername: "Instagram username (optional)", appointmentReminder: "Appointment reminder", requestReminder: "Request a reminder before your visit.", reminderAria: "Request an appointment reminder", notesLabel: "Notes (optional)", notesPlaceholder: "E.g. what you'd like, or who you'd prefer to book with.", notes: "Notes", photoLabel: "Reference photo (optional)", photoHint: "Attach nail inspiration — JPG, PNG or WebP, max 1 photo.", photo: "Photo", addPhoto: "Add photo", removePhoto: "Remove photo", photoAlt: "Nail reference photo", photoInvalidType: "Please upload a JPG, PNG, or WebP file.", photoTooLarge: "That file is too large (max 15 MB).", viewPhoto: "View photo full screen", reviewBooking: "Review booking", everythingRight: "Everything look right?", checkDetails: "Check the details before you confirm.", salon: "Salon", service: "Service", date: "Date", time: "Time", contact: "Contact", reminder: "Reminder", on: "On", off: "Off", confirmAppointment: "Confirm appointment", backAndEdit: "Go back and edit", bookingConfirmed: "Booking confirmed", youreBooked: "You're booked.", appointmentDetailsBelow: "Your appointment details are below.", bookAnother: "Book another appointment",
    staffNotebook: "N2D staff", staffLoginTitle: "Staff sign-in", staffLoginHint: "Access to the salon calendar is for managers only.", staffEmail: "Email", staffPassword: "Password", staffSignIn: "Sign in", staffSigningIn: "Signing in…", staffCheckingSession: "Checking your session…", staffLoginRequired: "Enter an email and password", staffLoginFailed: "Sign-in failed. Check your email and password.", staffAccessDeniedTitle: "Access denied", staffAccessDeniedText: "This account is not set up as a manager, so it doesn't have access to the salon calendar.", staffSignOut: "Sign out", staffLoadingSchedule: "Loading the salon calendar…", staffLoadError: "Could not load the calendar. Check your connection and try again.", staffActionFailed: "Couldn't complete that. Check your connection and try again.", staffWorking: "Saving…", savedToServer: "Saved", blockTime: "Block time", todayDay: "Today / day", week: "Week", calendar: "Calendar", weekOf: "Week of {date}", today: "Today", goToday: "Go to today", previous: "Previous", next: "Next", hoursTbd: "Hours TBD", capacityCount: "Capacity {count}", adjustDay: "Adjust day", calendarCapacity: "Capacity: {count}", appointmentAria: "{start} to {end}, {name}, {service}", blockedAria: "Blocked, {reason}, {start} to {end}", noBookingsYet: "No bookings yet", dayOpenAvailable: "This day is open and available.", noWorkingHours: "No working hours", setHoursHint: "Set hours to make this day available for booking.", setHours: "Set hours", noBookings: "No bookings", hoursNotConfigured: "Hours not configured",
    salonSettings: "Salon settings", setupDescription: "Services, hours and daily availability.", beforeLive: "Before going live", beforeLiveText: "Confirm weekday hours, weekend availability and the final service list. Capacity is the number of appointments the salon can handle at once. Reminder sending is not connected.", servicesDuration: "Services & duration", durationDetermines: "Duration determines which times clients can book.", addService: "Add service", availableToBook: "Available to book", inactive: "Inactive", weeklyHours: "Weekly working hours", forSalon: "For {salon}.", workingHours: "Working hours", notConfiguredTbd: "Not configured", tbd: "TBD", selectedDay: "Selected day", edit: "Edit", hours: "Hours", bookings: "Bookings", blocks: "Blocks",
    appointmentDetail: "Appointment details", appointment: "Appointment", bookingNotFound: "Booking not found", blockNotFound: "Block not found", notProvided: "Not provided", sendingNotConnected: "Sending is not connected", source: "Source", editDetails: "Edit details", saveDetails: "Save details", reschedule: "Reschedule", cancelBooking: "Cancel booking", close: "Close", cancelQuestion: "Cancel booking?", cancelExplanation: "This will remove the appointment from the active schedule. {date} at {start}–{end} will immediately become available for another client.", keepBooking: "Keep booking", cancelRelease: "Cancel & release time", originalHeld: "The original time remains reserved until you save. Only slots where all {duration} minutes fit are shown.", newDate: "New date", availableStart: "Available start time", noValidSlots: "No valid {duration}-minute slots on this date.", cancel: "Cancel", saveNewTime: "Save new time",
    addBooking: "Add booking", manualEntry: "Manual entry", manualNote: "For walk-ins, phone calls, or Instagram messages. Uses the same capacity rules as client booking.", startTime: "Start time", selectTime: "Select time", clientName: "Client name", phoneOrInstagram: "Phone or Instagram", reminderEnabled: "Reminder enabled", addToCalendar: "Add to calendar", editNote: "Edit the client and reminder details here. Use Reschedule to move the appointment so availability is rechecked.", contactType: "Contact type",
    blockUnavailable: "Block unavailable time", availability: "Availability", blockNote: "A full block uses all capacity. A partial block marks one person as unavailable. Existing bookings stay in place.", from: "From", until: "Until", capacityToBlock: "Capacity to block", capacityOf: "{used} of {total}", reason: "Reason", breakReason: "Break", unavailableTime: "Unavailable time", capacityUsed: "Capacity used", removeBlock: "Remove block", adjustThisDay: "Adjust this day", daySettingsNote: "These settings apply to this day only. Capacity is how many appointments the salon can handle at once. Existing bookings stay in place if capacity is reduced.", hoursConfigured: "Hours configured", turnOffTbd: "Turn off to mark this date as TBD.", open: "Open", closeTime: "Close", capacity: "Capacity", capacityOne: "1 person / appointment at once", capacityMany: "{count} people / appointments at once", saveDay: "Save day",
    addServiceTitle: "Add service", editService: "Edit service", servicesAndDuration: "Services & duration", serviceChangeNote: "Changes apply to new bookings. Existing appointments keep their current duration, including when moved.", serviceType: "Service type", variantOption: "Variant / option", duration: "Duration", minutes: "{count} minutes", activeForBooking: "Active for booking", inactiveExisting: "Inactive services remain on existing appointments.", saveService: "Save service", weeklyHoursTitle: "Weekly hours", hoursNote: "Set the usual hours for this weekday. Leave it unconfigured to show the day as TBD.", allowBookingWeekday: "Allow client booking on this weekday.", saveHours: "Save hours", closeDialog: "Close dialog",
    sourceDemo: "Demo data", sourceClient: "Online booking", sourceStaff: "Added by staff", resetConfirm: "Reset all local changes and restore the original demo schedule?", demoRestored: "Demo data restored", requiredContact: "Please add your name and contact", invalidName: "Please enter a valid name (letters, not just numbers or symbols).", invalidPhone: "Please enter a valid phone number.", invalidInstagram: "Please enter a valid Instagram username.", slotUnavailable: "That time is no longer available. Please choose another.", checkingAvailability: "Checking…", checkFailed: "Couldn't check", loadingCatalog: "Loading the salon's services…", catalogLoadError: "Could not load services. Check your connection and try again.", retry: "Try again", loadingTimes: "Loading available times…", availabilityLoadError: "Could not load available times.", bookingNetworkError: "Could not submit your booking. Check your internet connection and try again.", photoUploadError: "Could not upload the photo. Please try again, or continue without a photo.", photoLabelRequired: "Reference photo (required)", photoRequiredMessage: "Please upload a reference photo to continue.", photoUploadErrorRequired: "Could not upload the photo. Please try again.", submittingBooking: "Submitting your booking…", manualRequired: "Add a client, contact and available time", timeNoLongerAvailable: "That time is no longer available", bookingAdded: "Booking added to the calendar", timeAvailableAgain: "{start}–{end} is available again", chooseAvailableTime: "Choose an available time", movedReleased: "Moved from {old}; the old time was released", detailsUpdated: "Booking details updated", nameContactRequired: "Name and contact are required", endAfterStart: "End time must be after start time", blockedSuccess: "Unavailable time blocked", blockRemoved: "Block removed; capacity is available again", dailyUpdated: "Daily availability updated", serviceNameRequired: "Add a service type and variant", serviceSaved: "Service configuration saved", closingAfterOpening: "Closing time must be after opening", weeklyUpdated: "Weekly hours updated", placeholderName: "Name", placeholderServiceType: "e.g. New set", placeholderVariant: "e.g. With design", placeholderContact: "@username or phone", addressPlaceholder: "Location details coming soon",
    serviceGroupRefill: "Refill", serviceGroupNewSet: "New set", serviceGroupLashes: "Lashes", serviceGroupPedicure: "Pedicure",
    serviceVariantBasic: "Basic / no design", serviceVariantDesign: "With design", serviceVariantLashSet: "Lash set", serviceVariantPedicure: "Pedicure",
    priceFrom: "from {price} CZK", priceExact: "{price} CZK", addOnsSectionTitle: "Nail art add-ons (optional)", addOnsHint: "Can be added to this service. Some designs add the listed extra time to your appointment.", continueWithSelection: "Continue", servicePrice: "Service price", addOnsChosen: "Add-ons chosen", addOnsTotal: "Add-ons total", totalPrice: "Total", noAddOns: "No add-ons", lengthSectionTitle: "Nail length", lengthHint: "Choose a length before adding nail art.", lengthShort: "Short", lengthMedium: "Medium", lengthLong: "Long", lengthExtraLong: "Extra long", length: "Length", manualLengthRequired: "Choose a nail length first — available times will appear after that.", designModeSectionTitle: "Would you like nail art?", designModeHint: "Choose one option before continuing.", designModeNone: "No design", designModeNoneHint: "Just the selected length, no design.", designModeDesign: "Design", designModeDesignHint: "Choose from the design menu.", designModeCombo: "Design + inspiration", designModeComboHint: "Choose a design and attach an inspiration photo.",
    // Phase 3C — customer self-cancellation (en). Customer UI only; not added
    // to the vi (staff/admin) block, which is out of scope for this phase.
    haveBookingCancelIt: "Already have a booking? Cancel it", cancelLookupTitle: "Cancel your booking", cancelLookupHint: "Enter your booking reference and the phone number you booked with.", bookingReference: "Booking reference", bookingReferencePlaceholder: "Enter your booking reference", submitCancelBooking: "Cancel booking", cancelLookupWorking: "Cancelling…", cancelLookupNotFound: "We couldn't find a booking matching that reference and phone number.", cancelLookupAlreadyCancelled: "This booking has already been cancelled.", cancelLookupWindowClosed: "Bookings can only be cancelled up to 2 hours before the appointment. Please contact the salon directly.", cancelLookupSuccessTitle: "Booking cancelled", cancelLookupSuccessBody: "Your booking has been cancelled.", cancelLookupBack: "Back to booking",
  },
  vi: {
    activeForBooking: "Đang mở để đặt lịch", add: "Thêm", addBooking: "Thêm lịch hẹn", addOnsHint: "Có thể thêm vào dịch vụ này. Một số kiểu sẽ kéo dài thời gian hẹn theo thời gian đã ghi.", addOnsSectionTitle: "Vẽ/đính đá (tùy chọn)", addService: "Thêm dịch vụ", addServiceTitle: "Thêm dịch vụ", addToCalendar: "Thêm vào lịch", adjustDay: "Chỉnh ngày", adjustThisDay: "Chỉnh ngày này", allowBookingWeekday: "Cho phép khách đặt lịch vào ngày này trong tuần.", appointment: "Lịch hẹn", appointmentAria: "{start} đến {end}, {name}, {service}", appointmentDetail: "Chi tiết lịch hẹn", availability: "Tình trạng trống", availableStart: "Giờ bắt đầu còn trống", availableToBook: "Đang hoạt động", beforeLive: "Trước khi khai trương", beforeLiveText: "Xác nhận giờ làm việc trong tuần, giờ cuối tuần và danh sách dịch vụ cuối cùng. Sức chứa là số lịch hẹn tiệm có thể nhận cùng lúc. Gửi nhắc lịch tự động chưa được kết nối.", blockNotFound: "Không tìm thấy khoảng chặn", blockNote: "Chặn toàn phần sẽ dùng hết sức chứa. Chặn một phần chỉ đánh dấu một người không rảnh. Các lịch hẹn hiện có vẫn giữ nguyên.", blockRemoved: "Đã xóa khoảng chặn; sức chứa đã trống trở lại", blockTime: "Chặn thời gian", blockUnavailable: "Chặn thời gian không khả dụng", blockedAria: "Đã chặn, {reason}, {start} đến {end}", blockedSuccess: "Đã chặn thời gian không khả dụng", blocks: "Khoảng chặn", book: "Đặt lịch", bookingAdded: "Đã thêm lịch hẹn vào lịch", bookingNotFound: "Không tìm thấy lịch hẹn", bookings: "Lịch hẹn", brandTagline: "đặt lịch tiệm nail", breakReason: "Nghỉ", calendar: "Tháng", calendarCapacity: "Sức chứa: {count}", cancel: "Hủy", cancelBooking: "Hủy lịch hẹn", cancelExplanation: "Lịch hẹn sẽ bị xóa khỏi lịch đang hoạt động. Khung giờ {date} lúc {start}–{end} sẽ trống ngay cho khách khác.", cancelQuestion: "Hủy lịch hẹn?", cancelRelease: "Hủy và giải phóng giờ", capacity: "Sức chứa", capacityCount: "Sức chứa {count}", capacityMany: "{count} lịch hẹn cùng lúc", capacityOf: "{used} / {total}", capacityOne: "1 lịch hẹn mỗi lần", capacityToBlock: "Sức chứa cần chặn", capacityUsed: "Sức chứa đã dùng", chooseAvailableTime: "Chọn giờ còn trống", clientBooking: "Đặt lịch", clientName: "Tên khách", clientView: "Dành cho khách", close: "Đóng", closeDialog: "Đóng hộp thoại", closeTime: "Giờ đóng cửa", closingAfterOpening: "Giờ đóng cửa phải sau giờ mở cửa", confirmed: "Đã xác nhận", dailyUpdated: "Đã cập nhật tình trạng trống trong ngày", date: "Ngày", dayOpenAvailable: "Ngày này đang mở và còn chỗ trống.", daySettingsNote: "Thiết lập này chỉ áp dụng cho ngày này. Sức chứa là số lịch hẹn tiệm có thể nhận cùng lúc. Nếu giảm sức chứa, các lịch hẹn hiện có vẫn giữ nguyên.", demoNotice: "Bản demo tương tác — tên, dịch vụ và lịch chỉ là ví dụ", demoRestored: "Đã khôi phục dữ liệu demo", detailsUpdated: "Đã cập nhật thông tin lịch hẹn", duration: "Thời lượng", durationDetermines: "Thời lượng dịch vụ quyết định những khung giờ khách có thể đặt.", edit: "Sửa", editDetails: "Sửa thông tin", editNote: "Sửa thông tin liên hệ và nhắc lịch ở đây. Dùng Đổi lịch để chuyển giờ hẹn và kiểm tra lại chỗ trống.", editService: "Sửa dịch vụ", endAfterStart: "Giờ kết thúc phải sau giờ bắt đầu", forSalon: "Cho {salon}.", from: "Từ", goToday: "Về hôm nay", hours: "Giờ làm việc", hoursConfigured: "Đã thiết lập giờ làm việc", hoursNotConfigured: "Chưa thiết lập giờ làm việc", hoursNote: "Thiết lập giờ làm việc thường lệ cho ngày này trong tuần. Nếu không thiết lập, ngày sẽ hiển thị là chưa xác định.", hoursTbd: "Giờ mở cửa chưa xác định", inactive: "Ngừng hoạt động", inactiveExisting: "Dịch vụ ngừng hoạt động vẫn giữ nguyên trên các lịch hẹn hiện có.", instagram: "Instagram", instagramUsername: "Tên người dùng Instagram (tùy chọn)", keepBooking: "Giữ lịch hẹn", languageLabel: "Ngôn ngữ", lengthHint: "Chọn độ dài trước khi thêm vẽ/đính đá.", lengthSectionTitle: "Độ dài móng", manualEntry: "Nhập thủ công", manualLengthRequired: "Chọn độ dài móng trước — sau đó các khung giờ trống sẽ hiện ra.", manualNote: "Dùng cho khách vãng lai, gọi điện hoặc nhắn tin Instagram. Áp dụng cùng quy tắc sức chứa như đặt lịch online.", manualRequired: "Nhập tên khách, thông tin liên hệ và giờ còn trống", minutes: "{count} phút", movedReleased: "Đã chuyển từ {old}; giờ cũ đã được giải phóng", nameContactRequired: "Tên và thông tin liên hệ là bắt buộc", newDate: "Ngày mới", next: "Tiếp", noBookings: "Không có lịch hẹn", noBookingsYet: "Chưa có lịch hẹn nào", noValidSlots: "Không có khung giờ {duration} phút nào còn trống trong ngày này.", noWorkingHours: "Không có giờ làm việc", notConfiguredTbd: "Chưa thiết lập", notProvided: "Chưa cung cấp", notebookHome: "Trang chủ N2D", notes: "Ghi chú", notesLabel: "Ghi chú (không bắt buộc)", notesPlaceholder: "Ví dụ: khách muốn gì, hoặc muốn đặt với ai.", off: "Tắt", on: "Bật", open: "Mở cửa", originalHeld: "Giờ hẹn cũ vẫn được giữ cho đến khi bạn lưu thay đổi. Chỉ hiện các khung giờ đủ chỗ cho {duration} phút.", pageTitle: "N2D — Đặt lịch tiệm nail", phone: "Điện thoại", phoneNumber: "Số điện thoại", photoAlt: "Ảnh mẫu tham khảo móng", placeholderName: "Tên", placeholderServiceType: "ví dụ: Bộ móng mới", placeholderVariant: "ví dụ: Có vẽ", previous: "Trước", priceExact: "{price} Kč", priceFrom: "từ {price} Kč", reason: "Lý do", reminder: "Nhắc lịch", reminderEnabled: "Đã bật nhắc lịch", removeBlock: "Xóa khoảng chặn", reschedule: "Đổi lịch", resetConfirm: "Khôi phục lịch demo gốc và xóa toàn bộ thay đổi trên thiết bị này?", resetDemo: "Khôi phục demo", retry: "Thử lại", salon: "Tiệm", salonSettings: "Cài đặt tiệm", saveDay: "Lưu ngày", saveDetails: "Lưu thông tin", saveHours: "Lưu giờ làm việc", saveNewTime: "Lưu giờ mới", saveService: "Lưu dịch vụ", savedLocally: "Đã lưu trên thiết bị này", schedule: "Lịch", selectTime: "Chọn giờ", selectedDay: "Ngày đã chọn", sendingNotConnected: "Gửi nhắc lịch tự động chưa được kết nối", service: "Dịch vụ", serviceChangeNote: "Thay đổi áp dụng cho lịch hẹn mới. Lịch hẹn hiện có vẫn giữ nguyên thời lượng cũ, kể cả khi được đổi lịch.", serviceNameRequired: "Nhập loại dịch vụ và biến thể", serviceSaved: "Đã lưu dịch vụ", serviceType: "Loại dịch vụ", servicesAndDuration: "Dịch vụ & thời lượng", servicesDuration: "Dịch vụ & thời lượng", setHours: "Thiết lập giờ", setHoursHint: "Thiết lập giờ để mở ngày này cho đặt lịch.", setup: "Cài đặt", setupDescription: "Dịch vụ, giờ làm việc và tình trạng trống theo ngày.", source: "Nguồn", sourceClient: "Đặt lịch online", sourceDemo: "Dữ liệu demo", sourceStaff: "Nhân viên thêm", staffAccessDeniedText: "Tài khoản này chưa được thiết lập làm quản lý, nên không có quyền truy cập lịch của tiệm.", staffAccessDeniedTitle: "Không có quyền truy cập", staffActionFailed: "Không thể hoàn tất thao tác. Kiểm tra kết nối mạng và thử lại.", staffCalendar: "Lịch của tiệm", staffCheckingSession: "Đang kiểm tra phiên đăng nhập…", staffEmail: "Email", staffLoadError: "Không thể tải lịch của tiệm. Kiểm tra kết nối mạng và thử lại.", staffLoadingSchedule: "Đang tải lịch của tiệm…", staffLoginFailed: "Đăng nhập thất bại. Kiểm tra lại email và mật khẩu.", staffLoginHint: "Chỉ quản lý mới có quyền truy cập lịch của tiệm.", staffLoginRequired: "Nhập email và mật khẩu", staffLoginTitle: "Đăng nhập nhân viên", staffNotebook: "Dành cho tiệm N2D", staffPassword: "Mật khẩu", staffSignIn: "Đăng nhập", staffSignOut: "Đăng xuất", staffSigningIn: "Đang đăng nhập…", staffWorking: "Đang lưu…", startTime: "Giờ bắt đầu", tbd: "Chưa xác định", time: "Giờ", timeAvailableAgain: "Khung giờ {start}–{end} đã trống trở lại", timeNoLongerAvailable: "Khung giờ này không còn trống nữa", today: "Hôm nay", todayDay: "Hôm nay / ngày", turnOffTbd: "Tắt để đánh dấu ngày này là chưa xác định.", unavailableTime: "Thời gian không khả dụng", until: "Đến", variantOption: "Biến thể / tùy chọn", week: "Tuần", weekOf: "Tuần từ {date}", weeklyHours: "Giờ làm việc trong tuần", weeklyHoursTitle: "Giờ làm việc trong tuần", weeklyUpdated: "Đã cập nhật giờ làm việc trong tuần", workingHours: "Giờ làm việc", savedToServer: "Đã lưu",
    serviceGroupRefill: "Dặm bột", serviceGroupNewSet: "Bộ mới", serviceGroupLashes: "Mi", serviceGroupPedicure: "Chăm sóc chân",
    serviceVariantBasic: "Cơ bản / không vẽ", serviceVariantDesign: "Có vẽ", serviceVariantLashSet: "Bộ mi", serviceVariantPedicure: "Cổ điển",
  },
};

let customerLanguage = localStorage.getItem(LANGUAGE_KEY) === "en" ? "en" : "cs";
let staffLanguage = localStorage.getItem(STAFF_LANGUAGE_KEY) === "vi" ? "vi" : "cs";
// Active language is resolved from the current mode, never shared: customer mode
// always resolves to customerLanguage (cs/en), staff mode always to staffLanguage (cs/vi).
function currentLanguage() { return ui.mode === "staff" ? staffLanguage : customerLanguage; }
function t(key, values = {}) {
  const lang = currentLanguage();
  let value = STRINGS[lang][key] ?? STRINGS.cs[key] ?? key;
  Object.entries(values).forEach(([name, replacement]) => { value = value.replaceAll(`{${name}}`, String(replacement)); });
  return value;
}
function uiLocale() {
  const lang = currentLanguage();
  if (lang === "cs") return "cs-CZ";
  if (lang === "vi") return "vi-VN";
  return "en-GB";
}
function bookingCountLabel(count) {
  const lang = currentLanguage();
  if (lang === "en") return `${count} booking${count === 1 ? "" : "s"}`;
  if (lang === "vi") return `${count} lịch hẹn`;
  return `${count} ${count === 1 ? "rezervace" : count >= 2 && count <= 4 ? "rezervace" : "rezervací"}`;
}
function timeCountLabel(count) {
  const lang = currentLanguage();
  if (lang === "en") return `${count} time${count === 1 ? "" : "s"}`;
  if (lang === "vi") return `${count} khung giờ`;
  return `${count} ${count === 1 ? "termín" : count >= 2 && count <= 4 ? "termíny" : "termínů"}`;
}
function sourceLabel(source) {
  return source === "Demo data" ? t("sourceDemo") : source === "Client booking prototype" ? t("sourceClient") : source === "Added by staff" ? t("sourceStaff") : source;
}
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

// Phase 3D Issue 1: minimal pathname-aware routing. "/staff" (with or
// without a trailing slash) boots into the staff surface; every other path
// — "/", unknown paths, etc. — boots into customer booking. This is a
// navigation convenience only: it decides which screen renders first, never
// who is allowed to see staff data. Supabase Auth/RLS (is_staff()/
// staff_can_access_salon()) remain the only real authorization boundary,
// completely unchanged by this file — an unauthenticated visitor who loads
// /staff still only ever sees renderStaffLogin().
function normalizedPathname() {
  try { return (location.pathname || "/").replace(/\/+$/, "") || "/"; }
  catch { return "/"; }
}
function initialModeFromPath() { return normalizedPathname() === "/staff" ? "staff" : "customer"; }
// Keeps the address bar in sync with the current mode (so refresh/direct
// navigation/back-forward all land on the right surface) without adding a
// history entry when it's already correct.
function syncUrlForMode(mode) {
  try {
    const target = mode === "staff" ? "/staff" : "/";
    if (normalizedPathname() !== target) history.pushState(null, "", target);
  } catch { /* history API unavailable (e.g. file:// preview) — mode still works, just no URL sync */ }
}

const ui = {
  mode: initialModeFromPath(),
  staffSection: "schedule",
  staffView: "day",
  salonId: "orli",
  selectedDate: todayISO(),
  modal: null,
  customer: freshCustomer(),
};

// ---------------------------------------------------------------------------
// Real N2D service catalog (Orlí 17 + Kubíčkova/Bystrc), taken directly from
// the official price-list photos supplied for this update. Each location has
// its own prices/variants — never share a literal number between locations
// unless both price lists explicitly show the same figure.
//
// Duration provenance (see README for the full list): most durations below
// come straight from the confirmed recording-derived minutes. A few line
// items have no confirmed duration anywhere and are marked "assumed": those
// use a reasonable default so the online calendar keeps working, but the
// salon should double-check/adjust them in Setup → Services, where duration
// stays fully editable per variant, same as before this update.
// "inherited" means Orlí has no confirmed duration of its own but offers the
// exact same named pedicure as Bystrc, so Bystrc's confirmed minutes are
// reused per the duration-inheritance rule (not a guess).
// ---------------------------------------------------------------------------

// Zdobení (nail-art) add-ons: identical menu/prices/durationDelta at both
// locations per the confirmed N2D staff requirement. These are never
// independently bookable — they only attach to a Modelace umělých nehtů
// booking, and each design now adds its own durationDelta minutes on top of
// the selected nail length (see MODELACE_LENGTHS below). "Dlouhé nehty" was
// removed from this list — nail length is now its own required step instead.
const ZDOBENI_ITEMS = [
  { key: "francie-ombre", name: "Francie · Ombré", price: 100, priceFrom: true, durationDelta: 10 },
  { key: "malovani-1-nehet", name: "Malování 1 nehet", price: 15, priceFrom: true, durationDelta: 2 },
  { key: "malovani-komplet", name: "Malování komplet · Jednoduché", price: 150, priceFrom: true, durationDelta: 20 },
  { key: "trpytky-1-nehet", name: "Třpytky · 1 nehet", price: 15, priceFrom: true, durationDelta: 1 },
  { key: "trpytky-komplet", name: "Třpytky · Komplet", price: 100, priceFrom: true, durationDelta: 5 },
  { key: "magneticke-1-nehet", name: "Magnetické laky · 1 nehet", price: 15, priceFrom: true, durationDelta: 1 },
  { key: "magneticke-komplet", name: "Magnetické laky · Komplet", price: 100, priceFrom: true, durationDelta: 5 },
  { key: "chromove-1-nehet", name: "Chromové · 1 nehet", price: 15, priceFrom: true, durationDelta: 1 },
  { key: "chromove-komplet", name: "Chromové · Komplet", price: 100, priceFrom: true, durationDelta: 5 },
  { key: "kaminky", name: "Kamínky dle velikosti", price: 10, priceFrom: true, durationDelta: 10 },
  { key: "lakovani-3-barvy", name: "Lakování 3 a více barev", price: 50, priceFrom: true, durationDelta: 5 },
];

// Required nail-length step for Modelace umělých nehtů only, shown after the
// customer picks Doplnění/Nová aplikace and before any Zdobení design can be
// chosen. The selected length's minutes are the base of the final appointment
// duration; each chosen Zdobení design then adds its own durationDelta on top.
const MODELACE_LENGTHS = [
  { key: "short", minutes: 50, labelKey: "lengthShort" },
  { key: "medium", minutes: 55, labelKey: "lengthMedium" },
  { key: "long", minutes: 60, labelKey: "lengthLong" },
  { key: "extraLong", minutes: 70, labelKey: "lengthExtraLong" },
];
function lengthMinutesFor(lengthKey) { return MODELACE_LENGTHS.find(l => l.key === lengthKey)?.minutes ?? null; }
function lengthLabelText(lengthKey) { const l = MODELACE_LENGTHS.find(l => l.key === lengthKey); return l ? t(l.labelKey) : ""; }
function designDurationDelta(addOnIds) { return (addOnIds || []).reduce((sum, id) => sum + (addOnById(id)?.durationDelta || 0), 0); }
// Single source of truth for a customer booking's final duration: for
// Modelace umělých nehtů this is the selected length's minutes plus the sum
// of every chosen Zdobení design's durationDelta; every other category keeps
// using its fixed catalog duration exactly as before. Used consistently for
// slot availability, the date/time step, validation on confirm, and the
// duration/end time saved onto the appointment (which the staff calendar
// blocks against).
function customerBookingDuration(c, service) {
  service = service || serviceById(c.serviceId);
  if (!service) return 0;
  if (service.category === "modelace") {
    const lengthMin = lengthMinutesFor(c.length);
    // Strict allow-list (designModeIncludesAddOns): only "design" (or the
    // staff/manual draft's undefined designMode) lets chosen Zdobení designs
    // contribute — "none", "combo", null, and any invalid/tampered value
    // never do, even defensively, regardless of what's left in c.addOns.
    const designAddOns = designModeIncludesAddOns(c.designMode) ? c.addOns : [];
    // design_mode='combo' ("Design + inspo") always contributes a flat +30
    // minutes, confirmed by Vi and already implemented server-side
    // (nail-booking-backend/supabase/migrations/
    // 20260101000010_combo_design_duration.sql) — mirrored here so this
    // helper's result can never drift from what the server actually
    // computes/stores. The staff/manual draft's designMode is always
    // undefined (staff has no design-mode concept at all), so this term is
    // always +0 for staff — no staff behavior change.
    const comboBonus = c.designMode === "combo" ? 30 : 0;
    return (lengthMin != null ? lengthMin : service.duration) + designDurationDelta(designAddOns) + comboBonus;
  }
  return service.duration;
}

// Assumed-default minutes for real menu items with no confirmed duration from
// the recording (see comment block above). Flagged here in one place so
// they're easy to find and adjust later without hunting through the catalog.
const ASSUMED_DURATIONS = {
  zmenaBarvy: 20,           // Úprava nehtů · Změna barvy (both locations)
  lashRemoval: 20,          // Odstranění řas / v případě nové aplikace (both locations)
  browLashSingle: 30,       // Barvení řas, Barvení obočí, Úprava obočí
  liftingSingle: 60,        // Lash lifting alone, Brow lifting alone
  liftingCombo: 75,         // Any lifting + tint combination
  luxusniSpaPedikura: 90,   // N2D Luxusní spa pedikúra, all variants, both locations
  orliKlasickeLakovani: 35, // Orlí "Manikúra s klasickým lakováním" (no Bystrc equivalent to inherit)
};

// Builds the flattened, salon-scoped catalog for one location. Each entry
// becomes one "service" the same shape the rest of the app already expects
// (id, salonId, group, name, duration, active, color) plus price fields.
function buildCatalogForSalon(salonId, categories) {
  const services = [];
  categories.forEach((category, categoryIndex) => {
    const color = (categoryIndex % 4) + 1;
    category.items.forEach((item, itemIndex) => {
      services.push({
        id: `${salonId}-${category.id}-${itemIndex}`,
        salonId,
        category: category.id,
        group: category.name,
        name: item.name,
        duration: item.duration,
        price: item.price,
        priceFrom: !!item.priceFrom,
        priceLabel: item.priceLabel || null,
        active: true,
        color,
      });
    });
  });
  return services;
}

function addOnsForSalon(salonId) {
  return ZDOBENI_ITEMS.map(z => ({ id: `${salonId}-zdobeni-${z.key}`, salonId, name: z.name, price: z.price, priceFrom: !!z.priceFrom, durationDelta: z.durationDelta }));
}

function orliCategories() {
  return [
    {
      id: "manikura", name: "Manikúra", items: [
        { name: "Manikúra klasická", price: 300, duration: 20 },
        { name: "Manikúra s klasickým lakováním", price: 450, duration: ASSUMED_DURATIONS.orliKlasickeLakovani },
        { name: "Manikúra s lakováním CND Shellac", price: 590, duration: 45 },
      ]
    },
    {
      id: "modelace", name: "Modelace umělých nehtů", items: [
        { name: "Gelové / akrylové nehty s lakováním gellak · Doplnění", price: 570, duration: 50 },
        { name: "Gelové / akrylové nehty s lakováním gellak · Nová aplikace", price: 620, duration: 50 },
      ]
    },
    {
      id: "uprava", name: "Úprava nehtů", items: [
        { name: "1 nehet", price: 50, priceFrom: true, duration: 10 },
        { name: "Odstranění gelové · akrylové · Shellac", price: 150, duration: 10 },
        { name: "Odstranění v případě nové aplikace", price: 60, duration: 5 },
        { name: "Změna barvy", price: 200, duration: ASSUMED_DURATIONS.zmenaBarvy },
      ]
    },
    {
      id: "rasy", name: "Prodlužování řas", items: [
        { name: "Řasa na řasu · Nová aplikace", price: 790, duration: 60 },
        { name: "Řasa na řasu · Doplnění", price: 690, duration: 60 },
        { name: "Volume 2D-5D · Nová aplikace", price: 890, duration: 60 },
        { name: "Volume 2D-5D · Doplnění", price: 790, duration: 60 },
        { name: "Volume 6D-8D · Nová aplikace", price: 1090, duration: 60 },
        { name: "Volume 6D-8D · Doplnění", price: 990, duration: 60 },
        { name: "Designové (Wispy · Wet Look · Cat Eye · Fox Eye (L Curl) · Doll Eye · Kim K · Squirrel Mapping) · Nová aplikace", price: 1090, duration: 60 },
        { name: "Designové (Wispy · Wet Look · Cat Eye · Fox Eye (L Curl) · Doll Eye · Kim K · Squirrel Mapping) · Doplnění", price: 990, duration: 60 },
        { name: "Odstranění řas", price: 200, duration: ASSUMED_DURATIONS.lashRemoval },
        { name: "Odstranění řas v případě nové aplikace", price: 100, duration: ASSUMED_DURATIONS.lashRemoval },
      ]
    },
    {
      id: "obociarasy", name: "Obočí & řasy", items: [
        { name: "Barvení řas", price: 200, duration: ASSUMED_DURATIONS.browLashSingle },
        { name: "Barvení obočí", price: 150, duration: ASSUMED_DURATIONS.browLashSingle },
        { name: "Úprava obočí", price: 100, duration: ASSUMED_DURATIONS.browLashSingle },
        { name: "Lash lifting + barvení řas", price: 590, duration: ASSUMED_DURATIONS.liftingCombo },
        { name: "Brow lifting (laminace obočí) + Barvení Obočí", price: 590, duration: ASSUMED_DURATIONS.liftingCombo },
        { name: "Lash lifting", price: 490, duration: ASSUMED_DURATIONS.liftingSingle },
        { name: "Brow lifting (laminace obočí)", price: 490, duration: ASSUMED_DURATIONS.liftingSingle },
        { name: "Lash lifting + Brow lifting", price: 900, duration: ASSUMED_DURATIONS.liftingCombo },
        { name: "Lash lifting + Brow lifting + barvení", price: 1000, priceLabel: "900 + 100 Kč", duration: ASSUMED_DURATIONS.liftingCombo },
      ]
    },
    {
      id: "pedikura", name: "Pedikúra", items: [
        { name: "N2D Základní pedikúra · Bez laku", price: 480, duration: 40 },
        { name: "N2D Základní pedikúra · Gellak", price: 650, duration: 60 },
        { name: "N2D Základní pedikúra · CND Shellac", price: 650, duration: 60 },
        { name: "Footlogix Medicinální pedikúra · Bez laku", price: 650, duration: 40 },
        { name: "Footlogix Medicinální pedikúra · Gellak", price: 750, duration: 50 },
        { name: "Footlogix Medicinální pedikúra · CND Shellac", price: 750, duration: 60 },
        { name: "N2D Luxusní spa pedikúra · Bez laku", price: 790, duration: ASSUMED_DURATIONS.luxusniSpaPedikura },
        { name: "N2D Luxusní spa pedikúra · Gellak", price: 950, duration: ASSUMED_DURATIONS.luxusniSpaPedikura },
        { name: "N2D Luxusní spa pedikúra · CND Shellac", price: 1000, duration: ASSUMED_DURATIONS.luxusniSpaPedikura },
      ]
    },
  ];
}

function kubickovaCategories() {
  return [
    {
      id: "manikura", name: "Manikúra", items: [
        { name: "Manikúra klasická", price: 200, duration: 20 },
        { name: "Manikúra s lakováním CND Shellac", price: 490, duration: 45 },
        { name: "Manikúra s gel-lakem", price: 400, duration: 45 },
        { name: "Manikúra a P Shine", price: 300, duration: 30 },
      ]
    },
    {
      id: "modelace", name: "Modelace umělých nehtů", items: [
        { name: "Gelové / akrylové nehty s lakováním · Doplnění", price: 520, duration: 50 },
        { name: "Gelové / akrylové nehty s lakováním · Nová aplikace", price: 570, duration: 50 },
      ]
    },
    {
      id: "uprava", name: "Úprava nehtů", items: [
        { name: "1 nehet", price: 50, priceFrom: true, duration: 10 },
        { name: "Odstranění gelové · akrylové · Shellac", price: 150, duration: 10 },
        { name: "Odstranění v případě nové aplikace", price: 60, duration: 5 },
        { name: "Změna barvy", price: 200, duration: ASSUMED_DURATIONS.zmenaBarvy },
      ]
    },
    {
      id: "rasy", name: "Prodlužování řas", items: [
        { name: "Řasa na řasu · Nová aplikace", price: 790, duration: 60 },
        { name: "Řasa na řasu · Doplnění", price: 690, duration: 60 },
        { name: "Volume 2D-5D · Nová aplikace", price: 890, duration: 60 },
        { name: "Volume 2D-5D · Doplnění", price: 790, duration: 60 },
        { name: "Volume 6D-8D · Nová aplikace", price: 1090, duration: 60 },
        { name: "Volume 6D-8D · Doplnění", price: 990, duration: 60 },
        { name: "Designové (Wispy · Wet Look · Cat Eye · Fox Eye (L Curl) · Doll Eye · Kim K · Squirrel Mapping) · Nová aplikace", price: 1090, duration: 60 },
        { name: "Designové (Wispy · Wet Look · Cat Eye · Fox Eye (L Curl) · Doll Eye · Kim K · Squirrel Mapping) · Doplnění", price: 990, duration: 60 },
        { name: "Odstranění řas", price: 200, duration: ASSUMED_DURATIONS.lashRemoval },
        { name: "Odstranění řas v případě nové aplikace", price: 100, duration: ASSUMED_DURATIONS.lashRemoval },
      ]
    },
    {
      id: "obociarasy", name: "Obočí & řasy", items: [
        { name: "Barvení řas", price: 200, duration: ASSUMED_DURATIONS.browLashSingle },
        { name: "Barvení obočí", price: 150, duration: ASSUMED_DURATIONS.browLashSingle },
        { name: "Úprava obočí", price: 100, duration: ASSUMED_DURATIONS.browLashSingle },
        { name: "Lash lifting + barvení řas", price: 590, duration: ASSUMED_DURATIONS.liftingCombo },
        { name: "Brow lifting (laminace obočí) + Barvení Obočí", price: 590, duration: ASSUMED_DURATIONS.liftingCombo },
        { name: "Lash lifting", price: 490, duration: ASSUMED_DURATIONS.liftingSingle },
        { name: "Brow lifting (laminace obočí)", price: 490, duration: ASSUMED_DURATIONS.liftingSingle },
        { name: "Lash lifting + Brow lifting", price: 900, duration: ASSUMED_DURATIONS.liftingCombo },
        { name: "Lash lifting + Brow lifting + barvení", price: 1000, priceLabel: "900 + 100 Kč", duration: ASSUMED_DURATIONS.liftingCombo },
      ]
    },
    {
      id: "pedikura", name: "Pedikúra", items: [
        { name: "N2D Základní pedikúra · Bez laku", price: 480, duration: 40 },
        { name: "N2D Základní pedikúra · Gellak", price: 590, duration: 60 },
        { name: "N2D Základní pedikúra · CND Shellac", price: 650, duration: 60 },
        { name: "Footlogix Medicinální pedikúra · Bez laku", price: 550, duration: 40 },
        { name: "Footlogix Medicinální pedikúra · Gellak", price: 700, duration: 50 },
        { name: "Footlogix Medicinální pedikúra · CND Shellac", price: 750, duration: 60 },
        { name: "N2D Luxusní spa pedikúra · Bez laku", price: 790, duration: ASSUMED_DURATIONS.luxusniSpaPedikura },
        { name: "N2D Luxusní spa pedikúra · Gellak", price: 950, duration: ASSUMED_DURATIONS.luxusniSpaPedikura },
        { name: "N2D Luxusní spa pedikúra · CND Shellac", price: 1000, duration: ASSUMED_DURATIONS.luxusniSpaPedikura },
      ]
    },
  ];
}

function catalogServices() {
  return [...buildCatalogForSalon("orli", orliCategories()), ...buildCatalogForSalon("kubickova", kubickovaCategories())];
}
function catalogAddOns() {
  return [...addOnsForSalon("orli"), ...addOnsForSalon("kubickova")];
}

function formatPrice(item) {
  if (!item) return "";
  if (item.priceLabel) return item.priceLabel;
  // Root-cause guard: never interpolate a non-numeric price (e.g. undefined)
  // into the displayed string — fall back to 0 instead of rendering "undefined Kč".
  const price = Number.isFinite(Number(item.price)) ? Number(item.price) : 0;
  return item.priceFrom ? t("priceFrom", { price }) : t("priceExact", { price });
}
function addOnById(id) { return state.addOns.find(a => a.id === id); }
function addOnsForCurrentSalon(salonId) { return state.addOns.filter(a => a.salonId === salonId); }

// ---------------------------------------------------------------------------
// Phase 3A — customer-only remote data accessors (Supabase, real backend).
//
// These mirror the state-backed helpers above (addOnById, serviceById,
// salonName, customerBookingDuration...) exactly in shape, but read from
// remoteCatalog / availabilityCache (see supabase-client.js) instead of the
// local `state` object. They are used ONLY by the customer booking flow
// (renderCustomerStep, renderManiAddOns, confirmCustomerBooking and their
// direct helpers). The staff dashboard, manual booking, and everything else
// keep using the original state-backed helpers completely unchanged — the
// two data sources are deliberately kept separate so wiring the customer
// flow to the real backend can never affect staff/demo behaviour.
// ---------------------------------------------------------------------------
function remoteSalonName(id) { return remoteCatalog.salons.find(s => s.id === id)?.name || "Salon"; }
function remoteServiceById(id) { return remoteCatalog.services.find(s => s.id === id); }
function remoteServicesForSalon(salonId) { return remoteCatalog.services.filter(s => s.active && s.salonId === salonId); }
function remoteAddOnById(id) { return remoteCatalog.addOns.find(a => a.id === id); }
function remoteAddOnsForSalon(salonId) { return remoteCatalog.addOns.filter(a => a.salonId === salonId); }
// Prefers the server-fetched modelace_lengths (authoritative), falling back
// to the local MODELACE_LENGTHS constant (already verified identical to the
// seeded backend values) if the catalog hasn't loaded yet. This value is
// only ever used to preview a duration and pick which slots to query — the
// price/duration actually charged and persisted is always recomputed
// server-side by create_customer_booking regardless of this preview.
function remoteLengthMinutesFor(lengthKey) {
  const remote = remoteCatalog.modelaceLengths.find(l => l.key === lengthKey)?.minutes;
  return remote != null ? remote : lengthMinutesFor(lengthKey);
}
function remoteDesignDurationDelta(addOnIds) {
  return (addOnIds || []).reduce((sum, id) => sum + (remoteAddOnById(id)?.durationDelta || 0), 0);
}
// Direct remote-data counterpart of customerBookingDuration() — same formula,
// same guards, different data source. See customerBookingDuration() below
// for the rule this mirrors.
//
// Design + inspo (+30 minutes) — IMPLEMENTED, kept in sync with the server:
// design_mode='combo' always contributes a flat +30 minutes, confirmed by Vi
// and implemented server-side in create_customer_booking
// (nail-booking-backend/supabase/migrations/
// 20260101000010_combo_design_duration.sql, verified by
// nail-booking-backend/test/06_combo_design_duration.sql). This function's
// result is used both to decide which slots to QUERY (getRemoteAvailability/
// forceReloadRemoteAvailability — see the comment on remoteLengthMinutesFor()
// above) and to DISPLAY the expected duration/end time to the customer
// before they submit — the actual stored duration_minutes/end_time is still
// always independently recomputed and re-validated server-side on submit,
// so this client-side value only ever needs to match the server's formula
// for an accurate preview, never trusted for correctness. Keeping the +30
// term here (matching the server exactly: length + add-ons + 30-if-combo)
// means the calendar now offers/shows the same start times and duration the
// server will actually honor, instead of silently under-estimating by 30
// minutes as before this fix.
function remoteCustomerBookingDuration(c, service) {
  service = service || remoteServiceById(c.serviceId);
  if (!service) return 0;
  if (service.category === "modelace") {
    const lengthMin = remoteLengthMinutesFor(c.length);
    const designAddOns = designModeIncludesAddOns(c.designMode) ? c.addOns : [];
    const comboBonus = c.designMode === "combo" ? 30 : 0;
    return (lengthMin != null ? lengthMin : service.duration) + remoteDesignDurationDelta(designAddOns) + comboBonus;
  }
  return service.duration;
}


let state = loadState();
let toastTimer;
let modalReturnFocus = null;
// Photo lightbox is deliberately kept separate from ui.modal — it layers on top of
// the appointment detail modal (which must stay open/unchanged underneath) rather
// than replacing it, and it does not persist or touch any stored data.
let photoViewer = null; // { src } | null
let photoViewerReturnFocus = null;
// Guards against the same tab firing a second booking write (e.g. a rapid
// double-click) while one is already in flight through the booking lock.
// This is a same-tab convenience guard only — cross-tab serialization is
// handled by withBookingLock/reloadPersistedState above.
let customerBookingInFlight = false;
// Phase 3C: same same-tab double-submit guard idiom as customerBookingInFlight,
// kept as its own flag since cancellation and booking are different, never
// simultaneous, customer actions.
let cancelLookupInFlight = false;
let manualBookingInFlight = false;
// Phase 3B: every other staff write (cancel/reschedule/edit/block/day
// settings/service/hours) now makes a real network call instead of an
// instant local mutation, so each needs the same double-submit guard the
// manual-booking form already had. One shared flag is enough since the UI
// only ever has one modal open (one action in flight) at a time.
let staffActionInFlight = false;

function freshCustomer() {
  return {
    step: 0,
    salonId: null,
    serviceId: null,
    pendingManiId: null,
    addOns: [],
    length: null,
    designMode: null, // "none" | "design" | "combo" — Modelace-only, chosen after length (see renderManiAddOns)
    date: null,
    start: null,
    name: "",
    phone: "",
    instagram: "",
    notes: "",
    photo: null,
    reminder: true,
    confirmedId: null,
    // Phase 3A: the confirmed booking is now the row create_customer_booking
    // actually persisted server-side (mapped by mapRemoteAppointment), not a
    // lookup into local state — real bookings are never appended to
    // state.appointments. confirmedId is kept only for shape compatibility
    // with any remaining code that reads it; it is no longer used to look up
    // the confirmation screen's data.
    confirmedAppointment: null,
    // Phase 3C: "book" (the existing, unchanged 0-5 step wizard) or "cancel"
    // (the new, separate self-cancellation screen). These cancelX fields are
    // deliberately distinct from the booking draft's own name/phone/etc. so
    // switching into the cancel screen and back can never read/clobber an
    // in-progress booking draft.
    view: "book",
    cancelAppointmentId: "",
    cancelPhone: "",
    cancelStatus: "idle", // idle | loading | success | error
    cancelError: null, // "notFound" | "alreadyCancelled" | "windowClosed" | "network"
    cancelResult: null,
  };
}

function todayISO() { return toISO(new Date()); }
function toISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function parseISO(value) { return new Date(`${value}T12:00:00`); }
function addDays(value, amount) {
  const d = typeof value === "string" ? parseISO(value) : new Date(value);
  d.setDate(d.getDate() + amount);
  return toISO(d);
}
function startOfWeek(value) {
  const d = parseISO(value);
  const offset = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - offset);
  return toISO(d);
}
function minFromTime(value) {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}
function timeFromMin(value) {
  const safe = Math.max(0, Math.min(1440, value));
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}
function addMinutes(time, amount) { return timeFromMin(minFromTime(time) + Number(amount)); }
function uid(prefix) { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`; }
function esc(value = "") {
  return String(value).replace(/[&<>'"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c]));
}
function escNotes(value = "") {
  return esc(value).replace(/\n/g, "<br>");
}

// Reference photo attachment — local-only prototype.
// Images are downscaled/re-encoded client-side and stored as a data URL inside
// the existing localStorage JSON blob. This keeps the single confirmed photo
// small enough for typical localStorage quotas, but it is not a production
// file-storage solution (no backend, no external storage, no dependencies).
const ACCEPTED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_PHOTO_SOURCE_BYTES = 15 * 1024 * 1024; // guard against pathological uploads before we even try to decode them
const PHOTO_MAX_DIMENSION = 900;
const PHOTO_JPEG_QUALITY = 0.72;

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error("read-failed"));
    reader.readAsDataURL(file);
  });
}
function loadImageFromSrc(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("decode-failed"));
    img.src = src;
  });
}
// Downscales the source image onto a canvas and re-encodes it as JPEG so a single
// prototype booking never stores an oversized data URL in localStorage.
async function compressImageFile(file) {
  const sourceDataUrl = await readFileAsDataURL(file);
  const img = await loadImageFromSrc(sourceDataUrl);
  const scale = Math.min(1, PHOTO_MAX_DIMENSION / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", PHOTO_JPEG_QUALITY);
}
async function handlePhotoFile(file, onSuccess) {
  if (!file) return;
  if (!ACCEPTED_PHOTO_TYPES.includes(file.type)) { showToast(t("photoInvalidType")); return; }
  if (file.size > MAX_PHOTO_SOURCE_BYTES) { showToast(t("photoTooLarge")); return; }
  try {
    const dataUrl = await compressImageFile(file);
    onSuccess(dataUrl);
  } catch (e) {
    console.warn("Could not process reference photo", e);
    showToast(t("photoInvalidType"));
  }
}
function photoUploadField(idPrefix, photo, required = false) {
  const inputId = `${idPrefix}PhotoInput`;
  const removeAction = `remove-${idPrefix}-photo`;
  return `<div class="field">
    <label>${t(required ? "photoLabelRequired" : "photoLabel")}</label>
    ${photo
      ? `<div class="photo-preview"><img src="${photo}" alt="${t("photoAlt")}" class="photo-thumb"><button type="button" class="quiet-btn" data-action="${removeAction}">${t("removePhoto")}</button></div>`
      : `<label class="photo-upload" for="${inputId}">${t("addPhoto")}<input type="file" id="${inputId}" accept="image/jpeg,image/png,image/webp" hidden></label><p class="microcopy">${t("photoHint")}</p>`}
  </div>`;
}
function photoReviewRow(photo) {
  if (!photo) return "";
  return `<div class="review-row"><span>${esc(t("photo"))}</span><strong><img src="${photo}" alt="${t("photoAlt")}" class="photo-thumb"></strong></div>`;
}
function photoDetailRow(photo, apptId) {
  if (!photo) return "";
  // data-view-photo references the appointment id rather than embedding the (large)
  // data URL a second time in an attribute; the click handler looks it up from state.
  return `<div class="detail-row"><span>${t("photo")}</span><strong><button type="button" class="photo-thumb-btn" data-view-photo="${esc(apptId)}" aria-label="${t("viewPhoto")}"><img src="${photo}" alt="${t("photoAlt")}" class="photo-thumb photo-thumb-lg"></button></strong></div>`;
}

// Lightweight contact validation — intentionally simple, not full i18n phone/username validation.
function isValidName(value) {
  const trimmed = (value || "").trim();
  if (!trimmed) return false;
  // Require at least one Unicode letter somewhere (supports accented/international names).
  return /\p{L}/u.test(trimmed);
}
function isValidPhone(value) {
  const trimmed = (value || "").trim();
  if (!trimmed) return false;
  // Allow +, digits, spaces, parentheses, hyphens only; reject letters and other symbols.
  if (!/^[+\d\s()-]+$/.test(trimmed)) return false;
  const digitCount = (trimmed.match(/\d/g) || []).length;
  return digitCount >= 7 && digitCount <= 15;
}
function isValidInstagram(value) {
  const trimmed = (value || "").trim();
  if (!trimmed) return false;
  const handle = trimmed.startsWith("@") ? trimmed.slice(1) : trimmed;
  if (!handle) return false;
  // Instagram-style usernames: letters, numbers, periods, underscores.
  return /^[A-Za-z0-9._]{1,30}$/.test(handle);
}
function fmtDate(value, options = { weekday: "long", day: "numeric", month: "long" }) {
  return new Intl.DateTimeFormat(uiLocale(), options).format(parseISO(value));
}
function fmtShortDate(value) {
  return fmtDate(value, { weekday: "short", day: "numeric", month: "short" });
}
function salonName(id) { return state.salons.find(s => s.id === id)?.name || "Salon"; }
function serviceById(id) { return state.services.find(s => s.id === id); }
const SERVICE_LABEL_KEYS = {
  "refill-simple": { group: "serviceGroupRefill", name: "serviceVariantBasic" },
  "refill-design": { group: "serviceGroupRefill", name: "serviceVariantDesign" },
  "new-simple": { group: "serviceGroupNewSet", name: "serviceVariantBasic" },
  "new-design": { group: "serviceGroupNewSet", name: "serviceVariantDesign" },
  "lashes": { group: "serviceGroupLashes", name: "serviceVariantLashSet" },
  "pedicure": { group: "serviceGroupPedicure", name: "serviceVariantPedicure" },
};
function serviceGroupLabel(s) { const keys = SERVICE_LABEL_KEYS[s.id]; return keys ? t(keys.group) : s.group; }
function serviceVariantLabel(s) { const keys = SERVICE_LABEL_KEYS[s.id]; return keys ? t(keys.name) : s.name; }
function apptById(id) { return state.appointments.find(a => a.id === id); }
function keyFor(salonId, date) { return `${salonId}|${date}`; }
function isOverlap(startA, endA, startB, endB) {
  return minFromTime(startA) < minFromTime(endB) && minFromTime(endA) > minFromTime(startB);
}

function defaultHours() {
  return {
    0: { configured: false, start: "09:00", end: "17:00" },
    1: { configured: true, start: "09:00", end: "19:00" },
    2: { configured: true, start: "09:00", end: "19:00" },
    3: { configured: true, start: "09:00", end: "19:00" },
    4: { configured: true, start: "09:00", end: "19:00" },
    5: { configured: true, start: "09:00", end: "19:00" },
    6: { configured: false, start: "09:00", end: "17:00" },
  };
}

// Confirmed N2D Nails Orlí 17 hours: Mon–Fri 08:00–19:00, Sat–Sun 08:00–18:00.
function orliHours() {
  return {
    0: { configured: true, start: "08:00", end: "18:00" },
    1: { configured: true, start: "08:00", end: "19:00" },
    2: { configured: true, start: "08:00", end: "19:00" },
    3: { configured: true, start: "08:00", end: "19:00" },
    4: { configured: true, start: "08:00", end: "19:00" },
    5: { configured: true, start: "08:00", end: "19:00" },
    6: { configured: true, start: "08:00", end: "18:00" },
  };
}

// Confirmed N2D Nails Kubíčkova hours: Mon–Fri 09:00–20:00, Sat–Sun 09:00–19:00.
function kubickovaHours() {
  return {
    0: { configured: true, start: "09:00", end: "19:00" },
    1: { configured: true, start: "09:00", end: "20:00" },
    2: { configured: true, start: "09:00", end: "20:00" },
    3: { configured: true, start: "09:00", end: "20:00" },
    4: { configured: true, start: "09:00", end: "20:00" },
    5: { configured: true, start: "09:00", end: "20:00" },
    6: { configured: true, start: "09:00", end: "19:00" },
  };
}


function createDemoState() {
  const today = todayISO();
  const tomorrow = addDays(today, 1);
  const nextWork = addDays(today, 2);
  return {
    version: 6,
    salons: [
      { id: "orli", name: "N2D Nails Orlí 17", address: "Orlí 469/17, Brno-střed", defaultCapacity: 2, hours: orliHours() },
      { id: "kubickova", name: "N2D Nails Kubíčkova", address: "Kubíčkova 1080/6, Brno-Bystrc", defaultCapacity: 2, hours: kubickovaHours() },
    ],
    services: catalogServices(),
    addOns: catalogAddOns(),
    appointments: [
      demoAppt("a1", "orli", today, "10:00", "orli-manikura-0", "Anna", "+420 601 100 221", "@anna.demo"),
      demoAppt("a2", "orli", today, "11:00", "orli-modelace-1", "Sofia", "+420 601 104 552", "@sofia.demo"),
      demoAppt("a3", "orli", today, "12:00", "orli-rasy-0", "Julia", "+420 601 108 774", "@julia.demo"),
      demoAppt("a4", "orli", today, "14:30", "orli-pedikura-1", "Maya", "+420 601 112 903", "@maya.demo"),
      demoAppt("b1", "kubickova", today, "09:30", "kubickova-modelace-1", "Elise", "+420 601 117 226", "@elise.demo"),
      demoAppt("b2", "kubickova", today, "12:00", "kubickova-manikura-0", "Nadia", "+420 601 121 358", "@nadia.demo"),
      demoAppt("b3", "kubickova", today, "14:00", "kubickova-manikura-2", "Lena", "+420 601 125 590", "@lena.demo"),
      demoAppt("a5", "orli", tomorrow, "09:30", "orli-manikura-2", "Marta", "+420 601 129 812", "@marta.demo"),
      demoAppt("a6", "orli", tomorrow, "14:30", "orli-modelace-0", "Olivia", "+420 601 133 044", "@olivia.demo"),
      demoAppt("b4", "kubickova", nextWork, "11:00", "kubickova-rasy-1", "Kasia", "+420 601 137 276", "@kasia.demo"),
    ],
    blocks: [
      { id: "block-1", salonId: "orli", date: today, start: "15:00", end: "15:30", units: 1, reason: "Team break" },
      { id: "block-2", salonId: "orli", date: tomorrow, start: "13:00", end: "14:00", units: 2, reason: "Unavailable" },
      { id: "block-3", salonId: "kubickova", date: today, start: "13:00", end: "13:30", units: 1, reason: "Break" },
    ],
    dayOverrides: {
      [keyFor("kubickova", today)]: { capacity: 1 },
      [keyFor("orli", tomorrow)]: { capacity: 1 },
    },
  };
}

// Demo seed bookings reference real catalog ids directly so the sample calendar
// matches the real menu/prices exactly (no leftover placeholder service names).
function demoAppt(id, salonId, date, start, serviceId, name, phone, instagram) {
  const service = catalogServices().find(s => s.id === serviceId);
  const serviceName = `${service.group} · ${service.name}`;
  return { id, salonId, date, start, end: addMinutes(start, service.duration), serviceId, serviceName, duration: service.duration, length: null, color: service.color, price: service.price, priceFrom: service.priceFrom, priceLabel: service.priceLabel, addOns: [], addOnsTotal: 0, totalPrice: service.price, totalPriceFrom: service.priceFrom, name, phone, instagram, reminder: true, source: "Demo data", status: "confirmed", createdAt: Date.now() };
}

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (parsed?.version === 6) return parsed;
  } catch (e) { console.warn("Could not read local demo state", e); }
  return createDemoState();
}
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  const node = $("#savedState");
  if (node) {
    node.textContent = t("savedLocally");
    node.style.opacity = 1;
    setTimeout(() => { node.style.opacity = .65; }, 800);
  }
}

// --- Cross-tab booking safety (localStorage prototype only) ---------------
// localStorage has no atomic read-modify-write primitive and no cross-tab
// transaction support, so two tabs can each read the same "available" slot,
// both validate successfully, and the second saveState() call can silently
// clobber whatever the first tab just persisted. For a real product this
// must be enforced by a backend with atomic capacity checks; here we do the
// smallest reliable thing a static/local prototype can do:
//   1. Serialize the read -> validate -> append -> save critical section
//      across tabs with the Web Locks API where the browser supports it
//      (navigator.locks), so only one tab performs that sequence at a time.
//   2. Inside the lock, reload the latest persisted state from localStorage
//      before validating availability, so a tab never validates against (or
//      saves over) data another tab already committed while this tab was
//      idle/mid-flow.
//   3. If Web Locks isn't available (older browser), still always reload the
//      latest persisted state immediately before validating/saving — this
//      doesn't make the sequence atomic across processes, but it closes the
//      common "stale snapshot overwrites a newer save" failure mode.
const BOOKING_LOCK_NAME = "n2d-salon-booking-write";
function withBookingLock(criticalSection) {
  if (typeof navigator !== "undefined" && navigator.locks && typeof navigator.locks.request === "function") {
    return navigator.locks.request(BOOKING_LOCK_NAME, () => criticalSection());
  }
  return Promise.resolve().then(criticalSection);
}
// Replaces the live `state` reference with whatever is currently persisted,
// so a subsequent capacity/conflict check and save operate on the absolute
// latest cross-tab truth instead of a snapshot taken earlier in this tab's
// flow. Never overwrites the in-memory state with unreadable/old-schema
// data — if storage can't be read, the current in-memory state is kept as-is
// rather than risking a rollback to something worse.
function reloadPersistedState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (parsed?.version === 6) { state = parsed; return true; }
  } catch (e) { console.warn("Could not refresh local state before booking", e); }
  return false;
}

function getDayConfig(salonId, date) {
  const salon = state.salons.find(s => s.id === salonId);
  const base = salon.hours[parseISO(date).getDay()];
  const override = state.dayOverrides[keyFor(salonId, date)] || {};
  return {
    configured: override.configured ?? base.configured,
    start: override.start || base.start,
    end: override.end || base.end,
    capacity: Number(override.capacity || salon.defaultCapacity),
  };
}

function availableSlots(salonId, date, duration, ignoreAppointmentId = null) {
  const config = getDayConfig(salonId, date);
  if (!config.configured || minFromTime(config.end) <= minFromTime(config.start)) return [];
  const result = [];
  for (let t = minFromTime(config.start); t + duration <= minFromTime(config.end); t += 30) {
    let valid = true;
    for (let q = t; q < t + duration; q += 30) {
      const qStart = timeFromMin(q);
      const qEnd = timeFromMin(Math.min(q + 30, t + duration));
      const occupied = state.appointments
        .filter(a => a.status === "confirmed" && a.id !== ignoreAppointmentId && a.salonId === salonId && a.date === date && isOverlap(a.start, a.end, qStart, qEnd))
        .length;
      const blocked = state.blocks
        .filter(b => b.salonId === salonId && b.date === date && isOverlap(b.start, b.end, qStart, qEnd))
        .reduce((sum, b) => sum + Number(b.units), 0);
      if (occupied + blocked + 1 > config.capacity) { valid = false; break; }
    }
    if (valid) result.push(timeFromMin(t));
  }
  return result;
}

function showToast(message) {
  const node = $("#toast");
  node.textContent = message;
  node.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove("show"), 2600);
}

const LANGUAGE_BUTTON_LABELS = { cs: "CS", en: "EN", vi: "VI" };
const MODE_SWITCH_ARIA = { cs: "Zvolit zobrazení", en: "Choose experience", vi: "Chọn chế độ xem" };

function applyStaticTranslations() {
  const lang = currentLanguage();
  document.documentElement.lang = lang;
  document.title = t("pageTitle");
  $("#demoNotice").textContent = t("demoNotice");
  $("#resetDemo").textContent = t("resetDemo");
  $("#brandTagline").textContent = t("brandTagline");
  $(".brand").setAttribute("aria-label", t("notebookHome"));
  $("#customerModeLabel").textContent = t("clientBooking");
  $("#staffModeLabel").textContent = t("staffCalendar");
  $("#modeSwitch").setAttribute("aria-label", MODE_SWITCH_ARIA[lang] || MODE_SWITCH_ARIA.cs);
  $("#languageSwitch").setAttribute("aria-label", t("languageLabel"));
  // Staff writes now live in Supabase, not this device, so the persistent topbar
  // indicator must say so in staff mode; customer mode keeps its original wording.
  $("#savedState").textContent = ui.mode === "staff" ? t("savedToServer") : t("savedLocally");
  // Customer mode only ever offers Czech/English; staff mode only Czech/Vietnamese.
  // Rebuilding the button set per mode keeps the two language choices from mixing.
  const allowed = MODE_LANGUAGES[ui.mode] || MODE_LANGUAGES.customer;
  $("#languageSwitch").innerHTML = allowed.map(code => {
    const active = code === lang;
    return `<button type="button" data-language="${code}" class="${active ? "active" : ""}" aria-pressed="${active}">${LANGUAGE_BUTTON_LABELS[code]}</button>`;
  }).join("");
}

function setLanguage(nextLanguage) {
  const allowed = MODE_LANGUAGES[ui.mode] || MODE_LANGUAGES.customer;
  if (!allowed.includes(nextLanguage) || nextLanguage === currentLanguage()) return;
  if (ui.mode === "customer" && ui.customer.step === 3) syncCustomerFields();
  if (ui.mode === "staff") {
    staffLanguage = nextLanguage;
    localStorage.setItem(STAFF_LANGUAGE_KEY, staffLanguage);
  } else {
    customerLanguage = nextLanguage;
    localStorage.setItem(LANGUAGE_KEY, customerLanguage);
  }
  render();
}

function render() {
  applyStaticTranslations();
  document.body.dataset.mode = ui.mode;
  $$("[data-mode]").forEach(b => b.classList.toggle("active", b.dataset.mode === ui.mode));
  $("#app").innerHTML = ui.mode === "customer" ? renderCustomer() : renderStaff();
  renderMobileNav();
  renderModal();
}

function renderMobileNav() {
  const nav = $("#mobileNav");
  if (ui.mode === "customer") {
    // Phase 3D Issue 1: the customer-facing mobile nav must not expose a
    // path into the staff surface at all (previously showed a
    // "Kalendář salonu" button here unconditionally). Managers reach staff
    // via the dedicated /staff URL instead.
    nav.innerHTML = `
      <button class="active" data-mode="customer"><span class="nav-icon">✦</span>${t("book")}</button>`;
  } else if (!isStaffAuthorized()) {
    // Phase 3B: before a manager is signed in and authorized, the mobile nav
    // must not offer shortcuts (open-manual, schedule/setup sections) into
    // staff actions/data — renderStaff() itself already blocks these behind
    // the auth gate, but the mobile nav bar is rendered unconditionally by
    // render() and previously exposed these buttons regardless of auth
    // state. Only the client-view toggle remains.
    nav.innerHTML = `<button data-mode="customer"><span class="nav-icon">✦</span>${t("clientView")}</button>`;
  } else {
    nav.innerHTML = `
      <button class="${ui.staffSection === "schedule" ? "active" : ""}" data-staff-section="schedule"><span class="nav-icon">▤</span>${t("schedule")}</button>
      <button data-action="open-manual" aria-label="${t("addBooking")}"><span class="nav-icon">＋</span>${t("add")}</button>
      <button class="${ui.staffSection === "setup" ? "active" : ""}" data-staff-section="setup"><span class="nav-icon">⌁</span>${t("setup")}</button>
      <button data-mode="customer"><span class="nav-icon">✦</span>${t("clientView")}</button>`;
  }
}

function customerProgress() {
  const c = ui.customer;
  if (c.step >= 5) return 100;
  return [8, 25, 48, 70, 90][c.step] || 8;
}

function renderCustomer() {
  const c = ui.customer;
  // Phase 3C: self-cancellation is a separate screen, not a step in the
  // existing 0-5 booking wizard — it intentionally bypasses the wizard's own
  // top bar/back-button/progress indicator below (which are meaningless for
  // it) rather than trying to fit into that step machinery. The booking
  // wizard itself (labels/steps/progress) is completely unchanged.
  if (c.view === "cancel") return `<section class="customer-shell">${renderCancelLookup()}</section>`;
  const labels = [t("chooseSalon"), t("chooseService"), t("chooseTime"), t("yourDetails"), t("review"), t("confirmed")];
  return `<section class="customer-shell">
    <div class="customer-top">
      ${c.step > 0 && c.step < 5 ? `<button class="back-btn" data-action="customer-back" aria-label="${t("backAndEdit")}">‹</button>` : `<span style="width:31px"></span>`}
      <div class="progress-wrap">
        <div class="progress-label"><span>${esc(labels[c.step])}</span><span>${Math.min(c.step + 1, 5)} / 5</span></div>
        <div class="progress-track"><div class="progress-fill" style="width:${customerProgress()}%"></div></div>
      </div>
    </div>
    ${renderCustomerStep()}
  </section>`;
}

function renderCustomerStep() {
  const c = ui.customer;

  // Phase 3A: every step except the post-booking confirmation (step 5) needs
  // the real Supabase catalog. ensureRemoteCatalog() is a no-op unless the
  // cache is empty/stale/errored, so this is safe to call on every render.
  ensureRemoteCatalog(render);
  if (c.step < 5 && remoteCatalog.status !== "ready") {
    if (remoteCatalog.status === "error") {
      return `<div>
        <p class="eyebrow">${t("bookYourAppointment")}</p>
        <h1>${t("aLittleTime")}</h1>
        <div class="empty-times"><strong>${t("catalogLoadError")}</strong><br>
          <button type="button" class="quiet-btn" data-action="retry-catalog" style="margin-top:10px">${t("retry")}</button>
        </div>
      </div>`;
    }
    return `<div>
      <p class="eyebrow">${t("bookYourAppointment")}</p>
      <h1>${t("aLittleTime")}</h1>
      <div class="empty-times"><strong>${t("loadingCatalog")}</strong></div>
    </div>`;
  }

  if (c.step === 0) {
    return `<div>
      <p class="eyebrow">${t("bookYourAppointment")}</p>
      <h1>${t("aLittleTime")}</h1>
      <p class="subtle">${t("chooseSalonStart")}</p>
      <div style="height:18px"></div>
      <h2>${t("chooseASalon")}</h2>
      <div class="choice-stack">
        ${remoteCatalog.salons.map((salon, i) => `<button class="choice-card" data-customer-salon="${salon.id}" aria-label="${esc(t("chooseSalonAria", { salon: salon.name }))}">
          <span class="choice-main"><span class="salon-symbol">${i + 1}</span><span><strong>${esc(salon.name)}</strong><small>${esc(salon.address || t("locationSoon"))}</small></span></span><span class="choice-arrow" aria-hidden="true">›</span>
        </button>`).join("")}
      </div>
      <button type="button" class="quiet-btn full" data-action="open-cancel-lookup" style="margin-top:14px">${t("haveBookingCancelIt")}</button>
    </div>`;
  }
  if (c.step === 1) {
    const salonServices = remoteServicesForSalon(c.salonId);
    const groups = [...new Set(salonServices.map(s => s.group))];
    const addOns = remoteAddOnsForSalon(c.salonId);
    // Zdobení is an add-on to Modelace umělých nehtů only (not Manikúra).
    const manikuraGroupName = salonServices.find(s => s.category === "modelace")?.group;
    return `<div>
      <p class="eyebrow">${esc(remoteSalonName(c.salonId))}</p>
      <h1>${t("whatWouldYouLike")}</h1>
      <p class="subtle">${t("chooseServiceHint")}</p>
      ${groups.map(group => `<section class="service-group">
        <div class="service-group-title">${esc(serviceGroupLabel(salonServices.find(s => s.group === group)))}</div>
        <div class="choice-stack">
          ${salonServices.filter(s => s.group === group).map(s => `<button class="choice-card ${s.id === c.pendingManiId ? "selected" : ""}" data-customer-service="${s.id}" aria-label="${esc(t("serviceAria", { group: serviceGroupLabel(s), name: serviceVariantLabel(s), duration: s.duration }))}">
            <span><strong>${esc(serviceVariantLabel(s))}</strong></span><span class="duration-pill">${s.duration} min</span>
          </button>`).join("")}
        </div>
        ${group === manikuraGroupName && c.pendingManiId ? renderManiAddOns(c, addOns) : ""}
      </section>`).join("")}
    </div>`;
  }
  if (c.step === 2) {
    const service = remoteServiceById(c.serviceId);
    if (!service) { c.step = 1; return renderCustomerStep(); }
    const duration = remoteCustomerBookingDuration(c, service);
    const dates = Array.from({ length: 14 }, (_, i) => addDays(todayISO(), i));
    // Kick off/refresh every visible date's availability up front (cached,
    // TTL'd — see supabase-client.js) so the date strip and the selected
    // day's time grid are always backed by the same real, server-authoritative
    // data rather than anything computed/stored locally.
    const availByDate = {};
    dates.forEach(date => { availByDate[date] = getRemoteAvailability(c.salonId, date, duration, render); });
    if (!c.date) c.date = todayISO();
    const dayAvail = availByDate[c.date] || getRemoteAvailability(c.salonId, c.date, duration, render);

    const dateChips = dates.map(date => {
      const d = parseISO(date);
      const avail = availByDate[date];
      let availabilityLabel, chipUnavailable;
      if (avail.status === "loading") { availabilityLabel = t("checkingAvailability"); chipUnavailable = false; }
      else if (avail.status === "error") { availabilityLabel = t("checkFailed"); chipUnavailable = false; }
      else if (!avail.configured) { availabilityLabel = t("unavailable"); chipUnavailable = true; }
      else if (avail.times.length) { availabilityLabel = timeCountLabel(avail.times.length); chipUnavailable = false; }
      else { availabilityLabel = t("full"); chipUnavailable = true; }
      return `<button class="date-chip ${c.date === date ? "selected" : ""} ${chipUnavailable ? "unavailable" : ""}" data-customer-date="${date}" aria-pressed="${c.date === date}" aria-label="${esc(fmtShortDate(date))}, ${esc(availabilityLabel)}">
        <span class="dow">${d.toLocaleDateString(uiLocale(), { weekday: "short" })}</span><span class="num">${d.getDate()}</span><span class="tiny">${esc(availabilityLabel)}</span>
      </button>`;
    }).join("");

    let timeAreaHtml;
    if (dayAvail.status === "loading") {
      timeAreaHtml = `<div class="empty-times"><strong>${t("loadingTimes")}</strong></div>`;
    } else if (dayAvail.status === "error") {
      timeAreaHtml = `<div class="empty-times"><strong>${t("availabilityLoadError")}</strong><br><button type="button" class="quiet-btn" data-action="retry-availability" style="margin-top:10px">${t("retry")}</button></div>`;
    } else if (!dayAvail.configured) {
      timeAreaHtml = `<div class="empty-times"><strong>${t("noOnlineTimes")}</strong><br>${t("chooseAnotherDate")}</div>`;
    } else if (dayAvail.times.length) {
      timeAreaHtml = `<div class="time-grid">${dayAvail.times.map(time => `<button class="time-btn" data-customer-time="${time}" aria-label="${t("bookAt", { time })}">${time}</button>`).join("")}</div>`;
    } else {
      timeAreaHtml = `<div class="empty-times"><strong>${t("noTimesFit")}</strong><br>${t("tryAnotherDateService")}</div>`;
    }

    return `<div>
      <p class="eyebrow">${t("chooseTime")}</p>
      <h1>${t("whenSuits")}</h1>
      <div class="selection-summary"><span><strong>${esc(serviceGroupLabel(service))} · ${esc(serviceVariantLabel(service))}</strong>${t("minutesAtSalon", { duration, salon: esc(remoteSalonName(c.salonId)) })}</span><button data-action="change-service">${t("change")}</button></div>
      <div class="date-scroller">
        ${dateChips}
      </div>
      <div class="time-header"><h2>${c.date ? esc(fmtShortDate(c.date)) : t("selectDay")}</h2>${c.date ? `<span class="status-pill neutral">${duration} min</span>` : ""}</div>
      ${timeAreaHtml}
    </div>`;
  }
  if (c.step === 3) {
    const service = remoteServiceById(c.serviceId);
    const duration = remoteCustomerBookingDuration(c, service);
    return `<div>
      <p class="eyebrow">${t("almostThere")}</p><h1>${t("howReachYou")}</h1>
      <p class="subtle">${t("detailsHint")}</p>
      <div class="selection-summary"><span><strong>${esc(fmtShortDate(c.date))}, ${c.start}–${addMinutes(c.start, duration)}</strong>${esc(remoteSalonName(c.salonId))} · ${esc(serviceGroupLabel(service))} ${esc(serviceVariantLabel(service))}</span></div>
      <div class="field"><label for="customerName">${t("yourName")}</label><input id="customerName" class="input" autocomplete="name" placeholder="Anna" value="${esc(c.name)}"></div>
      <div class="field"><label for="customerPhone">${t("phoneNumber")}</label><input id="customerPhone" class="input" type="tel" autocomplete="tel" inputmode="tel" placeholder="+420 …" value="${esc(c.phone)}"></div>
      <div class="field"><label for="customerInstagram">${t("instagramUsername")}</label><input id="customerInstagram" class="input" autocomplete="off" placeholder="@username" value="${esc(c.instagram)}"></div>
      <div class="toggle-line"><span><strong>${t("appointmentReminder")}</strong><span class="microcopy">${t("requestReminder")}</span></span><label class="toggle"><input id="customerReminder" type="checkbox" ${c.reminder ? "checked" : ""} aria-label="${t("reminderAria")}"><span></span></label></div>
      <div class="field"><label for="customerNotes">${t("notesLabel")}</label><textarea id="customerNotes" class="input" rows="3" placeholder="${t("notesPlaceholder")}">${esc(c.notes)}</textarea></div>
      ${service.category === "modelace" ? "" : photoUploadField("customer", c.photo)}
      <div style="height:18px"></div><button class="primary-btn full" data-action="customer-details-next">${t("reviewBooking")}</button>
    </div>`;
  }
  if (c.step === 4) {
    const service = remoteServiceById(c.serviceId);
    // "No design" mode never carries chosen Zdobení designs into the review,
    // even defensively — mirrors the same guard in remoteCustomerBookingDuration().
    const chosenAddOns = (designModeIncludesAddOns(c.designMode) ? (c.addOns || []) : []).map(id => remoteAddOnById(id)).filter(Boolean);
    const duration = remoteCustomerBookingDuration(c, service);
    return `<div>
      <p class="eyebrow">${t("review")}</p><h1>${t("everythingRight")}</h1>
      <p class="subtle">${t("checkDetails")}</p>
      <div class="review-card card">
        ${reviewRow(t("salon"), remoteSalonName(c.salonId))}
        ${reviewRow(t("service"), `${serviceGroupLabel(service)} · ${serviceVariantLabel(service)} (${duration} min)`)}
        ${summaryExtrasRows(service.category, c.length, chosenAddOns)}
        ${reviewRow(t("date"), fmtDate(c.date))}
        ${reviewRow(t("time"), `${c.start}–${addMinutes(c.start, duration)}`)}
        ${reviewRow(t("yourName"), c.name)}
        ${reviewRow(t("phone"), c.phone)}
        ${reviewRow(t("instagram"), c.instagram)}
        ${reviewRow(t("reminder"), c.reminder ? t("on") : t("off"))}
        ${c.notes ? reviewRow(t("notes"), escNotes(c.notes)) : ""}
        ${photoReviewRow(c.photo)}
      </div>
      <button class="primary-btn full" data-action="confirm-booking" ${customerBookingInFlight ? "disabled" : ""}>${customerBookingInFlight ? t("submittingBooking") : t("confirmAppointment")}</button>
      <button class="quiet-btn full" data-action="customer-back" ${customerBookingInFlight ? "disabled" : ""}>${t("backAndEdit")}</button>
    </div>`;
  }
  const appt = c.confirmedAppointment;
  if (!appt) { ui.customer = freshCustomer(); return renderCustomerStep(); }
  return `<div class="confirmation">
    <div class="confirm-mark">✓</div><p class="eyebrow">${t("bookingConfirmed")}</p><h1>${t("youreBooked")}</h1>
    <p class="subtle">${t("appointmentDetailsBelow")}</p>
    <div class="review-card card">
      ${reviewRow(t("salon"), remoteSalonName(appt.salonId))}${reviewRow(t("service"), `${appt.serviceName} (${appt.duration} min)`)}${summaryExtrasRows(appt.category, appt.length, appt.addOns)}${reviewRow(t("date"), fmtDate(appt.date))}${reviewRow(t("time"), `${appt.start}–${appt.end}`)}${reviewRow(t("yourName"), appt.name)}${reviewRow(t("phone"), appt.phone)}${reviewRow(t("instagram"), appt.instagram)}${appt.notes ? reviewRow(t("notes"), escNotes(appt.notes)) : ""}${photoReviewRow(appt.photo)}
      ${appt.id ? reviewRow(t("bookingReference"), `<code>${esc(appt.id)}</code>`) : ""}
    </div>
    <button class="secondary-btn full" data-action="book-another">${t("bookAnother")}</button>
    ${appt.id ? `<button type="button" class="quiet-btn full" data-action="go-cancel-this-booking" data-id="${esc(appt.id)}">${t("haveBookingCancelIt")}</button>` : ""}
  </div>`;
}

// ---------------------------------------------------------------------------
// Phase 3C — customer self-cancellation screen. A separate screen from the
// 0-5 booking wizard above (reached via ui.customer.view === "cancel", see
// renderCustomer()), not a new wizard step. Calls the existing
// cancel_appointment_customer RPC via cancelRemoteCustomerBooking()
// (supabase-client.js) — the same ownership model (appointment id + the
// phone number used at booking) and the same server-enforced 2-hour cutoff
// that RPC has always had. Nothing here computes or pre-checks the cutoff;
// every outcome below is a direct reflection of what the server returned.
// ---------------------------------------------------------------------------
function renderCancelLookup() {
  const c = ui.customer;

  if (c.cancelStatus === "success" && c.cancelResult) {
    const r = c.cancelResult;
    return `<div class="confirmation">
      <div class="confirm-mark">✓</div><p class="eyebrow">${t("cancelBooking")}</p><h1>${t("cancelLookupSuccessTitle")}</h1>
      <p class="subtle">${t("cancelLookupSuccessBody")}</p>
      <div class="review-card card">
        ${reviewRow(t("salon"), remoteSalonName(r.salonId))}${reviewRow(t("service"), `${r.serviceName} (${r.duration} min)`)}${reviewRow(t("date"), fmtDate(r.date))}${reviewRow(t("time"), `${r.start}–${r.end}`)}
      </div>
      <button type="button" class="secondary-btn full" data-action="cancel-lookup-done">${t("close")}</button>
    </div>`;
  }

  const errorMessage = c.cancelStatus === "error" ? ({
    notFound: t("cancelLookupNotFound"),
    alreadyCancelled: t("cancelLookupAlreadyCancelled"),
    windowClosed: t("cancelLookupWindowClosed"),
    network: t("bookingNetworkError"),
  }[c.cancelError] || t("bookingNetworkError")) : null;

  return `<div>
    <p class="eyebrow">${t("cancelBooking")}</p><h1>${t("cancelLookupTitle")}</h1>
    <p class="subtle">${t("cancelLookupHint")}</p>
    <div class="field">
      <label for="cancelAppointmentId">${t("bookingReference")}</label>
      <input class="input" id="cancelAppointmentId" placeholder="${t("bookingReferencePlaceholder")}" value="${esc(c.cancelAppointmentId)}" ${cancelLookupInFlight ? "disabled" : ""}>
    </div>
    <div class="field">
      <label for="cancelPhoneInput">${t("phoneNumber")}</label>
      <input class="input" id="cancelPhoneInput" type="tel" value="${esc(c.cancelPhone)}" ${cancelLookupInFlight ? "disabled" : ""}>
    </div>
    ${errorMessage ? `<div class="empty-times"><strong>${errorMessage}</strong></div>` : ""}
    <button type="button" class="primary-btn full" data-action="submit-cancel-lookup" ${cancelLookupInFlight ? "disabled" : ""}>${cancelLookupInFlight ? t("cancelLookupWorking") : t("submitCancelBooking")}</button>
    <button type="button" class="quiet-btn full" data-action="cancel-lookup-back" ${cancelLookupInFlight ? "disabled" : ""}>${t("cancelLookupBack")}</button>
  </div>`;
}

function reviewRow(label, value) { return `<div class="review-row"><span>${esc(label)}</span><strong>${value}</strong></div>`; }

// Shared price breakdown used by the customer review step, the final
// confirmation screen, and (via rowFn) the staff appointment detail view, so
// service price / add-ons / total are always presented consistently.
function priceRowsHtml({ price, priceFrom, priceLabel, addOns, addOnsTotal, totalPrice, totalPriceFrom }, rowFn = reviewRow) {
  const rows = [rowFn(t("servicePrice"), priceLabel || (priceFrom ? t("priceFrom", { price }) : t("priceExact", { price })))];
  if (addOns && addOns.length) {
    rows.push(rowFn(t("addOnsChosen"), addOns.map(a => `${esc(a.name)} — ${esc(formatPrice(a))}`).join("<br>")));
    rows.push(rowFn(t("addOnsTotal"), t("priceFrom", { price: addOnsTotal })));
  }
  rows.push(rowFn(t("totalPrice"), totalPriceFrom ? t("priceFrom", { price: totalPrice }) : t("priceExact", { price: totalPrice })));
  return rows.join("");
}
function detailRow(label, value) { return `<div class="detail-row"><span>${esc(label)}</span><strong>${value}</strong></div>`; }
// Customer-facing summary of Modelace-only extras (chosen nail length and
// Zdobení design names) for the review and confirmation screens. Deliberately
// carries no price info — all prices are removed from the customer-facing
// booking flow; the underlying data (price, priceFrom, etc.) stays intact on
// the stored appointment for staff/admin views, which still show it.
function summaryExtrasRows(category, lengthKey, addOnObjs) {
  if (category !== "modelace") return "";
  const names = (addOnObjs || []).map(a => esc(a.name));
  return reviewRow(t("length"), lengthLabelText(lengthKey) || "—") + reviewRow(t("addOnsChosen"), names.length ? names.join("<br>") : t("noAddOns"));
}

// When returning to the service step with an eligible service already selected,
// reopen its add-on panel pre-filled with whatever Zdobení was already chosen.
// Zdobení is an add-on to Modelace umělých nehtů only (not Manikúra).
function reopenManiAddOnsIfNeeded() {
  const svc = remoteServiceById(ui.customer.serviceId);
  ui.customer.pendingManiId = (svc && svc.category === "modelace") ? svc.id : null;
}

// Zdobení is a Modelace umělých nehtů add-on, never a standalone service: picking
// a modelace card reveals this panel in place (no new wizard step) so the customer
// can pick a required nail length and then optionally add nail art before moving
// on to date/time. A nail length must be chosen first — Zdobení designs stay
// hidden, and Continue stays disabled, until then. The final duration is the
// selected length's minutes plus the sum of every chosen design's durationDelta.
// After a length is chosen, the customer must pick exactly one design mode —
// "none" (length only, no Zdobení), "design" (existing Zdobení picker, unchanged),
// or "combo" (same Zdobení picker plus an optional reference photo for the
// desired design, reusing the existing photo-attachment feature verbatim).
// Continue stays disabled until both a length AND a design mode are chosen.
const MODELACE_DESIGN_MODES = [
  { key: "none", labelKey: "designModeNone", hintKey: "designModeNoneHint" },
  { key: "design", labelKey: "designModeDesign", hintKey: "designModeDesignHint" },
  { key: "combo", labelKey: "designModeCombo", hintKey: "designModeComboHint" },
];
// Single strict source of truth for a valid design mode — exactly the three keys
// above ("none" | "design" | "combo"). Every place that used to accept any truthy
// value (a QA-demonstrated bypass: an arbitrary string like "hack" could satisfy
// `!!designMode`) must instead check membership here. Derived directly from
// MODELACE_DESIGN_MODES so the allow-list can never drift out of sync with the
// chips actually rendered to the customer.
function isValidDesignMode(mode) { return MODELACE_DESIGN_MODES.some(m => m.key === mode); }
// Whether a given designMode value should let chosen Zdobení designs contribute
// to duration/review/save. Only "design" does — "none", null, and any
// invalid/tampered value (e.g. "hack") never do. "combo" is deliberately
// EXCLUDED here (see the "Design + inspo" correction below): that mode no
// longer exposes any Zdobení add-on picker to the customer at all, so it
// must never carry add-ons, even defensively if c.addOns somehow still held
// a stale selection from switching modes. The staff/manual draft object
// never has a designMode property at all (`undefined`) because it has no
// design-mode gate; that case is intentionally treated as "always include",
// preserving staff/manual behavior exactly as it was before this
// customer-only feature existed.
function designModeIncludesAddOns(mode) { return mode === undefined || mode === "design"; }
// P1 business rule (owner: Vy): "Design + inspiration" (designMode "combo") REQUIRES
// a reference photo. No other design mode does. Shared by the wizard gate, the
// continue guard, the defensive confirm check, and the photo field's label.
function designModeRequiresPhoto(mode) { return mode === "combo"; }
function renderManiAddOns(c, addOns) {
  const service = remoteServiceById(c.pendingManiId);
  if (!service) return "";
  const lengthChosen = !!c.length;
  const designMode = c.designMode;
  // Operator correction (the design-mode/Zdobení picker was restored after an
  // earlier change removed it entirely by mistake): "none"/"design" behave
  // exactly as before — a length, then one of three design-mode choices, then
  // (for "design" only) the full Zdobení add-on picker. "combo" ("Design +
  // inspo") keeps its own chip and stays selectable, but its sub-flow is
  // simplified per Vi's explicit instruction: no Zdobení add-on panel is
  // shown under it anymore — only the reference/inspo photo upload. Combo's
  // duration contribution is a flat, confirmed +30 minutes rather than a sum
  // of selected add-ons (see remoteCustomerBookingDuration()); add-ons are
  // never part of a combo submission (designModeIncludesAddOns() above).
  const showDesignFlow = lengthChosen && designMode === "design";
  const showComboFlow = lengthChosen && designMode === "combo";
  // Delegates to the single shared formula (remoteCustomerBookingDuration)
  // instead of duplicating it inline, so this panel's displayed preview can
  // never drift from the duration actually used to query/reserve slots —
  // includes combo's confirmed +30 minutes automatically.
  const totalDuration = lengthChosen ? remoteCustomerBookingDuration(c, service) : null;
  // P1: in "Design + inspiration" the reference photo is mandatory, so Continue
  // stays disabled until one is attached. Other modes are unaffected.
  const photoMissing = designModeRequiresPhoto(designMode) && !c.photo;
  const canContinue = lengthChosen && isValidDesignMode(designMode) && !photoMissing;
  return `<div class="addon-panel">
    <div class="selection-summary"><span><strong>${esc(serviceVariantLabel(service))}</strong>${totalDuration != null ? `${totalDuration} min` : ""}</span></div>
    <div class="service-group-title" style="margin-top:16px">${t("lengthSectionTitle")}</div>
    <p class="microcopy" style="margin:-4px 0 10px">${t("lengthHint")}</p>
    <div class="addon-grid">
      ${MODELACE_LENGTHS.map(l => `<button type="button" class="addon-chip ${c.length === l.key ? "selected" : ""}" data-customer-length="${l.key}" aria-pressed="${c.length === l.key}">
        <strong>${esc(t(l.labelKey))}</strong><small>${l.minutes} min</small>
      </button>`).join("")}
    </div>
    ${lengthChosen ? `
    <div class="service-group-title" style="margin-top:16px">${t("designModeSectionTitle")}</div>
    <p class="microcopy" style="margin:-4px 0 10px">${t("designModeHint")}</p>
    <div class="addon-grid">
      ${MODELACE_DESIGN_MODES.map(m => `<button type="button" class="addon-chip ${designMode === m.key ? "selected" : ""}" data-customer-design-mode="${m.key}" aria-pressed="${designMode === m.key}">
        <strong>${esc(t(m.labelKey))}</strong><small>${esc(t(m.hintKey))}</small>
      </button>`).join("")}
    </div>` : ""}
    ${showDesignFlow ? `
    <div class="service-group-title" style="margin-top:16px">${t("addOnsSectionTitle")}</div>
    <p class="microcopy" style="margin:-4px 0 10px">${t("addOnsHint")}</p>
    <div class="addon-grid">
      ${addOns.map(a => `<button type="button" class="addon-chip ${c.addOns.includes(a.id) ? "selected" : ""}" data-customer-addon="${a.id}" aria-pressed="${c.addOns.includes(a.id)}">
        <strong>${esc(a.name)}</strong><small>+${a.durationDelta} min</small>
      </button>`).join("")}
    </div>` : ""}
    ${showComboFlow ? photoUploadField("customer", c.photo, true) : ""}
    ${showComboFlow && !c.photo ? `<p class="field-error">${t("photoRequiredMessage")}</p>` : ""}
    <div style="height:14px"></div>
    <button class="primary-btn full" data-action="continue-manicure" ${canContinue ? "" : "disabled"}>${t("continueWithSelection")}</button>
  </div>`;
}

// firstBookableDate() (local, state-backed 30-day availability scan) was
// removed here: the customer flow's step 2 now lands on today's date and
// lets the visible 14-day strip (backed by the real get_available_slots RPC)
// show what's actually open, rather than speculatively scanning up to 30
// days of remote availability with dozens of network round-trips just to
// pick a default landing day. See supabase-client.js / renderCustomerStep().

// ---------------------------------------------------------------------------
// Phase 3B auth gate. Everything staff-related now requires a real Supabase
// Auth session AND an active row in staff_profiles (checked server-side by
// RLS/the RPCs regardless of what this function decides to render — this
// gate only controls the UI, it is not itself the security boundary).
//
// Once authorized, `state` is reassigned (just for the render pass) to the
// live Supabase-backed data reshaped into the exact same shape the local
// demo state always had (see supabase-client.js fetchRemoteStaffState).
// Every existing render/modal function below reads `state` exactly as
// before and needs no further changes.
// ---------------------------------------------------------------------------
function renderStaff() {
  if (!staffAuthIsReady()) return renderStaffMessage(t("staffCheckingSession"));
  if (!isStaffAuthenticated()) return renderStaffLogin();
  if (!isStaffAuthorized()) return renderStaffAccessDenied();

  ensureStaffData(ui.selectedDate, render);
  if (remoteStaffState.status === "error" && !remoteStaffState.data) {
    return renderStaffMessage(t("staffLoadError"), true);
  }
  if (!remoteStaffState.data) {
    return renderStaffMessage(t("staffLoadingSchedule"));
  }

  // Bridge: replace the in-memory `state` with the freshly-fetched real
  // data before building any HTML below. This intentionally happens on
  // EVERY renderStaff() call (not just the first), which also means the
  // "Reset demo" button (still wired to the pre-existing local demo state,
  // untouched by this phase) can never leak fake data into a logged-in
  // manager's view: even if it overwrites `state` with demo data, the very
  // next render — including the one resetDemo's own handler triggers —
  // rebridges `state` back to the real Supabase data before anything is
  // displayed, and resetDemo never touches Supabase itself.
  state = remoteStaffState.data;
  if (!state.salons.find(s => s.id === ui.salonId) && state.salons.length) ui.salonId = state.salons[0].id;

  const side = `<aside class="staff-side">
    <div class="side-date"><div class="big">${parseISO(todayISO()).getDate()}</div><small>${esc(fmtDate(todayISO(), { weekday: "long" }))} · ${esc(fmtDate(todayISO(), { month: "long" }))}</small></div>
    <nav class="side-nav"><button class="${ui.staffSection === "schedule" ? "active" : ""}" data-staff-section="schedule">▤ &nbsp;${t("schedule")}</button><button data-action="open-manual">＋ &nbsp;${t("addBooking")}</button><button class="${ui.staffSection === "setup" ? "active" : ""}" data-staff-section="setup">⌁ &nbsp;${t("setup")}</button><button data-mode="customer">✦ &nbsp;${t("clientBooking")}</button><button data-action="staff-sign-out">↩ &nbsp;${t("staffSignOut")}</button></nav>
  </aside>`;
  return `<div class="staff-layout">${side}<div class="staff-main">${ui.staffSection === "schedule" ? renderSchedule() : renderSetup()}</div></div>`;
}

// Minimal, centered technical-state screen shared by the loading/checking-
// session/load-error states — deliberately plain (reuses existing card/
// button classes only) since the approved staff UI itself is otherwise left
// untouched, per the "no redesign" constraint.
function renderStaffMessage(message, isError = false) {
  return `<div class="staff-layout"><div class="staff-main" style="grid-column:1/-1"><div class="no-hours"><div><div class="empty-icon">${isError ? "!" : "⌁"}</div><h2>${esc(message)}</h2>${isError ? `<button class="secondary-btn" data-action="staff-retry-load">${t("retry")}</button>` : ""}</div></div></div></div>`;
}

function renderStaffLogin() {
  const err = lastStaffAuthError();
  return `<div class="staff-layout"><div class="staff-main" style="grid-column:1/-1"><div class="no-hours"><div style="max-width:340px;margin:0 auto;text-align:left">
    <h2 style="text-align:center">${t("staffLoginTitle")}</h2>
    <p class="subtle" style="text-align:center">${t("staffLoginHint")}</p>
    <div id="staffLoginForm">
      <div class="field"><label for="staffLoginEmail">${t("staffEmail")}</label><input class="input" type="email" id="staffLoginEmail" autocomplete="username"></div>
      <div class="field"><label for="staffLoginPassword">${t("staffPassword")}</label><input class="input" type="password" id="staffLoginPassword" autocomplete="current-password"></div>
      ${err ? `<p class="status-pill warn" style="display:block;margin:8px 0">${esc(t("staffLoginFailed"))}</p>` : ""}
      <button type="button" class="primary-btn full" data-action="staff-sign-in" ${staffActionInFlight ? "disabled" : ""}>${staffActionInFlight ? t("staffSigningIn") : t("staffSignIn")}</button>
    </div>
  </div></div></div></div>`;
}

function renderStaffAccessDenied() {
  return `<div class="staff-layout"><div class="staff-main" style="grid-column:1/-1"><div class="no-hours"><div>
    <div class="empty-icon">⌁</div>
    <h2>${t("staffAccessDeniedTitle")}</h2>
    <p class="subtle">${t("staffAccessDeniedText")}</p>
    <button class="secondary-btn" data-action="staff-sign-out">${t("staffSignOut")}</button>
  </div></div></div></div>`;
}

function salonTabs() {
  return `<div class="segmented salon-tabs">${state.salons.map(s => `<button class="${ui.salonId === s.id ? "active" : ""}" data-staff-salon="${s.id}">${esc(s.name)}</button>`).join("")}</div>`;
}

function renderSchedule() {
  return `<div>
    <div class="staff-heading"><div><p class="eyebrow">${t("staffNotebook")}</p><h1>${t("schedule")}</h1></div><div class="staff-actions"><button class="secondary-btn" data-action="open-block">${t("blockTime")}</button><button class="primary-btn" data-action="open-manual">＋ ${t("add")}</button></div></div>
    <div class="staff-controls-row">${salonTabs()}<div class="viewbar"><div class="segmented">${["day", "week", "month"].map(v => `<button class="${ui.staffView === v ? "active" : ""}" data-staff-view="${v}">${v === "day" ? t("todayDay") : v === "month" ? t("calendar") : t("week")}</button>`).join("")}</div></div></div>
    ${renderDateNav()}
    ${ui.staffView === "day" ? renderDaySchedule() : ui.staffView === "week" ? renderWeek() : renderMonth()}
  </div>`;
}

function renderDateNav() {
  const delta = ui.staffView === "week" ? 7 : ui.staffView === "month" ? 30 : 1;
  const title = ui.staffView === "month" ? fmtDate(ui.selectedDate, { month: "long", year: "numeric" }) : ui.staffView === "week" ? t("weekOf", { date: fmtDate(startOfWeek(ui.selectedDate), { day: "numeric", month: "short" }) }) : fmtDate(ui.selectedDate, { weekday: "long", day: "numeric", month: "long" });
  return `<div class="date-nav"><button class="icon-btn" data-date-move="-${delta}" aria-label="${t("previous")}">‹</button><div class="date-nav-title"><strong>${esc(title)}</strong><small>${ui.selectedDate === todayISO() ? t("today") : `<button style="border:0;background:none;padding:0;color:inherit;cursor:pointer" data-action="go-today">${t("goToday")}</button>`}</small></div><button class="icon-btn" data-date-move="${delta}" aria-label="${t("next")}">›</button></div>`;
}

function renderDaySchedule() {
  const config = getDayConfig(ui.salonId, ui.selectedDate);
  const appts = state.appointments.filter(a => a.status === "confirmed" && a.salonId === ui.salonId && a.date === ui.selectedDate).sort((a, b) => a.start.localeCompare(b.start));
  const blocks = state.blocks.filter(b => b.salonId === ui.salonId && b.date === ui.selectedDate);
  return `<div class="day-meta"><div class="pills"><span class="status-pill neutral">${config.configured ? `${config.start}–${config.end}` : t("hoursTbd")}</span><span class="status-pill ${config.capacity === 1 ? "warn" : ""}">${t("capacityCount", { count: config.capacity })}</span><span class="status-pill neutral">${bookingCountLabel(appts.length)}</span></div><button data-action="open-day-settings">${t("adjustDay")}</button></div>
    <div class="schedule-card">
      ${config.configured ? renderTimeline(config, appts, blocks) : `<div class="no-hours"><div><div class="empty-icon">⌁</div><h2>${t("noWorkingHours")}</h2><p class="subtle">${t("setHoursHint")}</p><button class="secondary-btn" data-action="open-day-settings">${t("setHours")}</button></div></div>`}
    </div>`;
}

function renderTimeline(config, appts, blocks) {
  const start = minFromTime(config.start), end = minFromTime(config.end);
  const pxPerMin = 1;
  const laid = assignLanes(appts, config.capacity);
  // Phase 3D Issue 2 fix: lay out every event/block's top+height FIRST (the
  // exact same per-item formulas as before — positioning and the existing
  // minimum card heights, 30px for appointments / 25px for blocks, are both
  // unchanged), THEN size the timeline container to whichever is tallest:
  // the configured day span, the 420px floor, or the bottom edge of the
  // tallest rendered card. Previously the container height was derived only
  // from the configured day span, so a short appointment near closing time
  // — whose minimum-height floor pushes its bottom edge past that span —
  // could render partially outside the container and get clipped by
  // .schedule-card's overflow:hidden. Sizing the container from real layout
  // output instead removes that clipping without touching any event's
  // position or minimum size.
  const eventLayout = laid.map(({ a, lane }) => {
    const top = minFromTime(a.start) - start + 2;
    const h = Math.max(30, minFromTime(a.end) - minFromTime(a.start) - 4);
    return { a, lane, top, h };
  });
  const blockLayout = blocks.map(b => {
    const top = Math.max(0, minFromTime(b.start) - start + 2);
    const h = Math.max(25, minFromTime(b.end) - minFromTime(b.start) - 4);
    return { b, top, h };
  });
  const maxContentBottom = Math.max(0, ...eventLayout.map(e => e.top + e.h), ...blockLayout.map(e => e.top + e.h));
  const height = Math.max(420, end - start, maxContentBottom + 2);
  const labels = [];
  for (let t = start; t <= end; t += 60) labels.push(`<span class="time-label" style="top:${t - start}px">${timeFromMin(t)}</span>`);
  const eventHtml = eventLayout.map(({ a, lane, top, h }) => {
    const width = 100 / config.capacity;
    return `<button class="appt-card color-${a.color || 1}" data-appointment="${a.id}" aria-label="${esc(t("appointmentAria", { start: a.start, end: a.end, name: a.name, service: a.serviceName }))}" title="${esc(`${a.name} · ${a.serviceName}`)}" style="top:${top}px;height:${h}px;left:calc(${lane * width}% + 2px);width:calc(${width}% - 4px)"><span class="appt-time">${a.start}–${a.end}</span><strong class="appt-name">${esc(a.name)}</strong><span class="appt-service">${esc(a.serviceName)}</span></button>`;
  }).join("");
  const blockHtml = blockLayout.map(({ b, top, h }) => {
    const width = Math.min(100, Number(b.units) / config.capacity * 100);
    return `<button class="block-card" data-block="${b.id}" aria-label="${esc(t("blockedAria", { reason: b.reason, start: b.start, end: b.end }))}" title="${esc(`${b.reason} · ${b.start}–${b.end}`)}" style="top:${top}px;height:${h}px;width:calc(${width}% - 3px)">${esc(b.reason)} · ${b.start}</button>`;
  }).join("");
  const emptyState = !appts.length && !blocks.length ? `<div class="timeline-empty"><strong>${t("noBookingsYet")}</strong><span>${t("dayOpenAvailable")}</span></div>` : "";
  return `<div class="schedule-head"><span>${t("time")}</span><span><strong>${esc(salonName(ui.salonId))}</strong> · ${t("calendarCapacity", { count: config.capacity })}</span></div><div class="timeline" style="height:${height}px;background-size:100% 60px">${labels.join("")}${emptyState}<div class="timeline-events">${blockHtml}${eventHtml}</div></div>`;
}

function assignLanes(appts, capacity) {
  const laneEnds = Array(Math.max(1, capacity)).fill(-1);
  return appts.map(a => {
    const s = minFromTime(a.start);
    let lane = laneEnds.findIndex(end => end <= s);
    if (lane < 0) lane = laneEnds.indexOf(Math.min(...laneEnds));
    laneEnds[lane] = minFromTime(a.end);
    return { a, lane };
  });
}

function renderWeek() {
  const start = startOfWeek(ui.selectedDate);
  return `<div class="week-grid">${Array.from({ length: 7 }, (_, i) => {
    const date = addDays(start, i); const conf = getDayConfig(ui.salonId, date);
    const appts = state.appointments.filter(a => a.status === "confirmed" && a.salonId === ui.salonId && a.date === date).sort((a, b) => a.start.localeCompare(b.start));
    return `<article class="week-day card ${date === todayISO() ? "today" : ""}" data-week-day="${date}"><div class="week-day-head"><strong>${esc(fmtDate(date, { weekday: "short" }))} ${parseISO(date).getDate()}</strong><span>${conf.configured ? t("capacityCount", { count: conf.capacity }) : t("tbd")}</span></div>${appts.length ? appts.map(a => `<div class="mini-event color-${a.color}" data-appointment="${a.id}"><b>${a.start}</b> ${esc(a.name)}<br><span>${esc(a.serviceName)}</span></div>`).join("") : `<div class="mini-empty">${conf.configured ? t("noBookings") : t("hoursNotConfigured")}</div>`}</article>`;
  }).join("")}</div>`;
}

function renderMonth() {
  const focus = parseISO(ui.selectedDate); const first = new Date(focus.getFullYear(), focus.getMonth(), 1, 12); const offset = (first.getDay() + 6) % 7; first.setDate(first.getDate() - offset);
  const days = Array.from({ length: 42 }, (_, i) => { const d = new Date(first); d.setDate(d.getDate() + i); return toISO(d); });
  const weekdayLabels = Array.from({ length: 7 }, (_, i) => new Date(2024, 0, i + 1).toLocaleDateString(uiLocale(), { weekday: "short" }));
  return `<div class="month-card card"><div class="month-labels">${weekdayLabels.map(x => `<span>${x}</span>`).join("")}</div><div class="month-grid">${days.map(date => {
    const count = state.appointments.filter(a => a.status === "confirmed" && a.salonId === ui.salonId && a.date === date).length;
    const d = parseISO(date); const muted = d.getMonth() !== focus.getMonth();
    return `<button class="month-day ${muted ? "muted" : ""} ${date === todayISO() ? "today" : ""} ${date === ui.selectedDate ? "selected" : ""}" data-month-day="${date}"><span class="month-num">${d.getDate()}</span>${count ? `<span class="event-dots">${Array.from({ length: Math.min(count, 3) }, () => "<i></i>").join("")}</span><span class="event-count">${count}</span>` : ""}</button>`;
  }).join("")}</div></div>`;
}

function renderSetup() {
  const salon = state.salons.find(s => s.id === ui.salonId);
  const todayConfig = getDayConfig(ui.salonId, ui.selectedDate);
  const dayNames = Array.from({ length: 7 }, (_, i) => new Date(2024, 0, i + 7).toLocaleDateString(uiLocale(), { weekday: "long" }));
  return `<div>
    <div class="setup-header"><p class="eyebrow">${t("salonSettings")}</p><h1>${t("setup")}</h1><p class="subtle">${t("setupDescription")}</p></div>
    ${salonTabs()}
    <div class="assumption-box"><strong>${t("beforeLive")}</strong>${t("beforeLiveText")}</div>
    <div class="setup-columns"><div>
      <section class="setup-section"><div class="section-head"><div><h2>${t("servicesDuration")}</h2><p class="microcopy">${t("durationDetermines")}</p></div><button data-action="add-service">＋ ${t("addService")}</button></div>
        ${(() => {
          const salonServices = state.services.filter(s => s.salonId === ui.salonId);
          const groups = [...new Set(salonServices.map(s => s.group))];
          return groups.map(group => `<div class="service-group-title" style="margin:16px 0 9px">${esc(group)}</div><div class="service-list card">${salonServices.filter(s => s.group === group).map(s => `<button type="button" class="service-row ${s.active ? "" : "inactive"}" data-edit-service="${s.id}"><span><strong>${esc(serviceVariantLabel(s))}</strong><small>${s.active ? t("availableToBook") : t("inactive")} · ${esc(formatPrice(s))}</small></span><span class="service-meta"><span class="duration-pill">${s.duration} min</span><span aria-hidden="true">›</span></span></button>`).join("")}</div>`).join("");
        })()}
      </section>
    </div><div>
      <section class="setup-section"><div class="section-head"><div><h2>${t("weeklyHours")}</h2><p class="microcopy">${t("forSalon", { salon: esc(salon.name) })}</p></div></div>
        <div class="hours-list card">${dayNames.map((name, i) => { const h = salon.hours[i]; return `<button type="button" class="hours-row" data-edit-hours="${i}"><span><strong>${name}</strong><small>${h.configured ? t("workingHours") : t("notConfiguredTbd")}</small></span><span class="${h.configured ? "" : "status-pill warn"}">${h.configured ? `${h.start}–${h.end}` : t("tbd")} &nbsp;<span aria-hidden="true">›</span></span></button>`; }).join("")}</div>
      </section>
      <section class="setup-section"><div class="section-head"><div><h2>${t("selectedDay")}</h2><p class="microcopy">${esc(fmtShortDate(ui.selectedDate))}</p></div><button data-action="open-day-settings">${t("edit")}</button></div>
        <div class="today-config card"><strong>${esc(salon.name)}</strong><div class="config-grid"><div class="config-tile"><span>${t("hours")}</span><strong>${todayConfig.configured ? `${todayConfig.start}–${todayConfig.end}` : t("tbd")}</strong></div><div class="config-tile"><span>${t("capacity")}</span><strong>${todayConfig.capacity}</strong></div><div class="config-tile"><span>${t("bookings")}</span><strong>${state.appointments.filter(a => a.status === "confirmed" && a.salonId === ui.salonId && a.date === ui.selectedDate).length}</strong></div><div class="config-tile"><span>${t("blocks")}</span><strong>${state.blocks.filter(b => b.salonId === ui.salonId && b.date === ui.selectedDate).length}</strong></div></div></div>
      </section>
    </div></div>
  </div>`;
}

function renderModal() {
  const root = $("#modalRoot");
  const existingDialog = root.querySelector(".modal");
  const previousType = root.dataset.modalType;
  const activeId = existingDialog?.contains(document.activeElement) ? document.activeElement.id : "";

  if (!ui.modal) {
    root.innerHTML = "";
    delete root.dataset.modalType;
    document.body.classList.remove("modal-open");
    const returnTarget = modalReturnFocus;
    modalReturnFocus = null;
    if (returnTarget?.isConnected) requestAnimationFrame(() => returnTarget.focus());
    return;
  }

  if (!existingDialog && document.activeElement instanceof HTMLElement) modalReturnFocus = document.activeElement;
  const content = modalContent(ui.modal);
  document.body.classList.add("modal-open");
  root.dataset.modalType = ui.modal.type;
  root.innerHTML = `<div class="modal-backdrop" data-modal-backdrop><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle"><div class="modal-head"><div><p class="eyebrow">${esc(content.eyebrow || t("staffCalendar"))}</p><h2 id="modalTitle">${esc(content.title)}</h2></div><button class="modal-close" data-action="close-modal" aria-label="${t("closeDialog")}">×</button></div><div class="modal-body">${content.body}</div>${content.foot || ""}</section></div>`;

  requestAnimationFrame(() => {
    const preserved = previousType === ui.modal?.type && activeId ? root.querySelector(`#${CSS.escape(activeId)}`) : null;
    (preserved || root.querySelector(".modal-close"))?.focus();
  });
}

// Full-screen reference-photo viewer. Layers above the appointment modal in its own
// root so opening/closing it never touches ui.modal or re-renders the modal beneath —
// the appointment detail stays exactly as it was when the viewer is dismissed.
function renderPhotoViewer() {
  const root = $("#photoViewerRoot");
  if (!photoViewer) {
    root.innerHTML = "";
    document.body.classList.remove("photo-viewer-open");
    const returnTarget = photoViewerReturnFocus;
    photoViewerReturnFocus = null;
    if (returnTarget?.isConnected) requestAnimationFrame(() => returnTarget.focus());
    return;
  }
  document.body.classList.add("photo-viewer-open");
  root.innerHTML = `<div class="photo-viewer-backdrop" data-photo-viewer-backdrop role="dialog" aria-modal="true" aria-label="${esc(t("photoAlt"))}">
    <button type="button" class="photo-viewer-close" data-action="close-photo-viewer" aria-label="${t("closeDialog")}">×</button>
    <img class="photo-viewer-img" src="${photoViewer.src}" alt="${esc(t("photoAlt"))}">
  </div>`;
  requestAnimationFrame(() => root.querySelector(".photo-viewer-close")?.focus());
}
function openPhotoViewer(src) {
  if (!src) return;
  photoViewerReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  photoViewer = { src };
  renderPhotoViewer();
}
function closePhotoViewer() {
  if (!photoViewer) return;
  photoViewer = null;
  renderPhotoViewer();
}

function modalContent(modal) {
  if (modal.type === "appointment") return appointmentModal(modal);
  if (modal.type === "cancel") return cancelModal(modal);
  if (modal.type === "reschedule") return rescheduleModal(modal);
  if (modal.type === "manual") return manualModal(modal);
  if (modal.type === "edit-appointment") return editAppointmentModal(modal);
  if (modal.type === "block") return blockModal(modal);
  if (modal.type === "block-detail") return blockDetailModal(modal);
  if (modal.type === "day-settings") return daySettingsModal(modal);
  if (modal.type === "service") return serviceModal(modal);
  if (modal.type === "hours") return hoursModal(modal);
  return { title: "", body: "" };
}

function appointmentModal(modal) {
  const a = apptById(modal.id);
  if (!a) return { title: t("bookingNotFound"), body: "" };
  return { title: a.name, eyebrow: t("appointmentDetail"), body: `
    <div class="detail-hero"><span class="status-pill">${t("confirmed")}</span><div class="time-big">${a.start}–${a.end}</div><strong>${esc(fmtDate(a.date))}</strong></div>
    <div class="detail-list"><div class="detail-row"><span>${t("service")}</span><strong>${esc(a.serviceName)}<br><small>${t("minutes", { count: a.duration })}</small></strong></div>${a.price != null ? priceRowsHtml({ price: a.price, priceFrom: a.priceFrom, priceLabel: a.priceLabel, addOns: a.addOns, addOnsTotal: a.addOnsTotal, totalPrice: a.totalPrice, totalPriceFrom: a.totalPriceFrom }, detailRow) : ""}<div class="detail-row"><span>${t("phone")}</span><strong>${esc(a.phone || t("notProvided"))}</strong></div><div class="detail-row"><span>${t("instagram")}</span><strong>${esc(a.instagram || t("notProvided"))}</strong></div><div class="detail-row"><span>${t("salon")}</span><strong>${esc(salonName(a.salonId))}</strong></div><div class="detail-row"><span>${t("reminder")}</span><strong>${a.reminder ? t("on") : t("off")}${a.reminder ? `<br><small>${t("sendingNotConnected")}</small>` : ""}</strong></div>${a.notes ? `<div class="detail-row"><span>${t("notes")}</span><strong>${escNotes(a.notes)}</strong></div>` : ""}${photoDetailRow(a.photo, a.id)}<div class="detail-row"><span>${t("source")}</span><strong>${esc(sourceLabel(a.source || "Added by staff"))}</strong></div></div>
    <div class="modal-actions-grid"><button data-action="open-edit-appointment" data-id="${a.id}">${t("editDetails")}</button><button data-action="open-reschedule" data-id="${a.id}">${t("reschedule")}</button><button class="danger" data-action="open-cancel" data-id="${a.id}">${t("cancelBooking")}</button><button data-action="close-modal">${t("close")}</button></div>` };
}

function cancelModal(modal) {
  const a = apptById(modal.id);
  const explanation = a ? t("cancelExplanation", { date: fmtShortDate(a.date), start: a.start, end: a.end }) : t("cancelBooking");
  return { title: t("cancelQuestion"), eyebrow: a?.name || t("appointment"), body: `<div class="warning-card">${explanation}</div>`, foot: `<div class="modal-foot"><button class="secondary-btn" data-action="close-modal">${t("keepBooking")}</button><button class="danger-btn" data-action="confirm-cancel" data-id="${modal.id}" ${staffActionInFlight ? "disabled" : ""}>${staffActionInFlight ? t("staffWorking") : t("cancelRelease")}</button></div>` };
}

function rescheduleModal(modal) {
  const a = apptById(modal.id); if (!a) return { title: t("bookingNotFound"), body: "" };
  const date = modal.date || a.date; const slots = availableSlots(a.salonId, date, a.duration, a.id);
  return { title: t("reschedule"), eyebrow: a.name, body: `<div class="inline-note">${t("originalHeld", { duration: a.duration })}</div><div class="field"><label for="rescheduleDate">${t("newDate")}</label><input class="input" id="rescheduleDate" type="date" min="${todayISO()}" value="${date}"></div><div class="field"><span class="field-label">${t("availableStart")}</span>${slots.length ? `<div class="slot-picker">${slots.map(slot => `<button class="${modal.time === slot ? "selected" : ""}" data-reschedule-time="${slot}">${slot}</button>`).join("")}</div>` : `<div class="empty-times">${t("noValidSlots", { duration: a.duration })}</div>`}</div>`, foot: `<div class="modal-foot"><button class="secondary-btn" data-action="close-modal">${t("cancel")}</button><button class="primary-btn" data-action="save-reschedule" data-id="${a.id}" ${(modal.time && !staffActionInFlight) ? "" : "disabled"}>${staffActionInFlight ? t("staffWorking") : t("saveNewTime")}</button></div>` };
}

function manualModal(modal) {
  const d = modal.draft;
  // The catalog is salon-scoped: if the current draft's service doesn't belong
  // to the currently selected salon (e.g. right after switching salons), fall
  // back to that salon's first active service instead of showing a mismatch.
  let service = serviceById(d.serviceId);
  if (!service || service.salonId !== d.salonId) {
    service = state.services.find(s => s.active && s.salonId === d.salonId);
    d.serviceId = service?.id || null;
  }
  const isModelace = service?.category === "modelace";
  if (!isModelace) { d.length = null; d.addOns = []; }
  const lengthChosen = !!d.length;
  // Same shared source of truth as the customer flow: for Modelace umělých
  // nehtů the final duration is the selected length's minutes plus the sum
  // of every chosen Zdobení design's durationDelta; every other category
  // keeps its fixed catalog duration. A length must be chosen before any
  // duration/slots can be computed for Modelace, mirroring the customer
  // flow's requirement that Zdobení stays hidden and nothing is bookable
  // until a length is picked.
  const duration = !service ? null : (isModelace ? (lengthChosen ? customerBookingDuration(d, service) : null) : service.duration);
  const slots = (service && duration != null) ? availableSlots(d.salonId, d.date, duration) : [];
  if (d.time && !slots.includes(d.time)) d.time = null;
  const modelaceAddOns = isModelace ? addOnsForCurrentSalon(d.salonId) : [];
  const modelacePanelHtml = isModelace ? `<div class="field span-2 addon-panel">
    <div class="service-group-title" style="margin-top:0">${t("lengthSectionTitle")}</div>
    <p class="microcopy" style="margin:-4px 0 10px">${t("lengthHint")}</p>
    <div class="addon-grid">
      ${MODELACE_LENGTHS.map(l => `<button type="button" class="addon-chip ${d.length === l.key ? "selected" : ""}" data-manual-length="${l.key}" aria-pressed="${d.length === l.key}">
        <strong>${esc(t(l.labelKey))}</strong><small>${l.minutes} min</small>
      </button>`).join("")}
    </div>
    ${lengthChosen ? `
    <div class="service-group-title" style="margin-top:16px">${t("addOnsSectionTitle")}</div>
    <p class="microcopy" style="margin:-4px 0 10px">${t("addOnsHint")}</p>
    <div class="addon-grid">
      ${modelaceAddOns.map(a => `<button type="button" class="addon-chip ${d.addOns.includes(a.id) ? "selected" : ""}" data-manual-addon="${a.id}" aria-pressed="${d.addOns.includes(a.id)}">
        <strong>${esc(a.name)}</strong><small>+${a.durationDelta} min</small>
      </button>`).join("")}
    </div>` : `<p class="microcopy" style="margin:10px 0 0">${t("manualLengthRequired")}</p>`}
  </div>` : "";
  return { title: t("addBooking"), eyebrow: t("manualEntry"), body: `<div class="inline-note">${t("manualNote")}</div><div class="form-grid">
    <div class="field"><label for="manualSalon">${t("salon")}</label><select class="select" id="manualSalon">${state.salons.map(s => `<option value="${s.id}" ${d.salonId === s.id ? "selected" : ""}>${esc(s.name)}</option>`).join("")}</select></div>
    <div class="field"><label for="manualService">${t("service")}</label><select class="select" id="manualService">${state.services.filter(s => s.active && s.salonId === d.salonId).map(s => `<option value="${s.id}" ${d.serviceId === s.id ? "selected" : ""}>${esc(serviceGroupLabel(s))} · ${esc(serviceVariantLabel(s))} — ${esc(formatPrice(s))} (${s.duration}m)</option>`).join("")}</select></div>
    ${modelacePanelHtml}
    <div class="field"><label for="manualDate">${t("date")}</label><input class="input" id="manualDate" type="date" value="${d.date}"></div>
    <div class="field"><label for="manualTime">${t("startTime")}</label><select class="select" id="manualTime"><option value="">${t("selectTime")}</option>${slots.map(slot => `<option value="${slot}" ${d.time === slot ? "selected" : ""}>${slot}</option>`).join("")}</select></div>
    <div class="field"><label for="manualName">${t("clientName")}</label><input class="input" id="manualName" placeholder="${t("placeholderName")}" value="${esc(d.name)}"></div>
    <div class="field"><label for="manualPhone">${t("phoneNumber")}</label><input class="input" id="manualPhone" type="tel" placeholder="+420 …" value="${esc(d.phone)}"></div>
    <div class="field"><label for="manualInstagram">${t("instagramUsername")}</label><input class="input" id="manualInstagram" placeholder="@username" value="${esc(d.instagram)}"></div>
    <div class="field span-2"><label for="manualNotes">${t("notesLabel")}</label><textarea id="manualNotes" class="input" rows="3" placeholder="${t("notesPlaceholder")}">${esc(d.notes)}</textarea></div>
    <div class="field span-2"><div class="toggle-line"><span><strong>${t("reminderEnabled")}</strong><span class="microcopy">${t("sendingNotConnected")}.</span></span><label class="toggle"><input id="manualReminder" type="checkbox" ${d.reminder ? "checked" : ""} aria-label="${t("reminderEnabled")}"><span></span></label></div></div>
  </div>`, foot: `<div class="modal-foot"><button class="secondary-btn" data-action="close-modal">${t("cancel")}</button><button class="primary-btn" data-action="save-manual" ${manualBookingInFlight ? "disabled" : ""}>${manualBookingInFlight ? t("staffWorking") : t("addToCalendar")}</button></div>` };
}

function editAppointmentModal(modal) {
  const a = apptById(modal.id); if (!a) return { title: t("bookingNotFound"), body: "" };
  return { title: t("editDetails"), eyebrow: a.name, body: `<div class="inline-note">${t("editNote")}</div><div class="field"><label for="editName">${t("clientName")}</label><input class="input" id="editName" value="${esc(a.name)}"></div><div class="field"><label for="editPhone">${t("phoneNumber")}</label><input class="input" id="editPhone" type="tel" value="${esc(a.phone)}"></div><div class="field"><label for="editInstagram">${t("instagramUsername")}</label><input class="input" id="editInstagram" value="${esc(a.instagram ?? "")}"></div><div class="field"><label for="editNotes">${t("notesLabel")}</label><textarea id="editNotes" class="input" rows="3" placeholder="${t("notesPlaceholder")}">${esc(a.notes || "")}</textarea></div><div class="toggle-line"><span><strong>${t("reminderEnabled")}</strong><span class="microcopy">${t("sendingNotConnected")}.</span></span><label class="toggle"><input id="editReminder" type="checkbox" ${a.reminder ? "checked" : ""} aria-label="${t("reminderEnabled")}"><span></span></label></div>`, foot: `<div class="modal-foot"><button class="secondary-btn" data-action="close-modal">${t("cancel")}</button><button class="primary-btn" data-action="save-edit-appointment" data-id="${a.id}" ${staffActionInFlight ? "disabled" : ""}>${staffActionInFlight ? t("staffWorking") : t("saveDetails")}</button></div>` };
}

function blockModal(modal) {
  const d = modal.draft; const conf = getDayConfig(d.salonId, d.date);
  return { title: t("blockUnavailable"), eyebrow: t("availability"), body: `<div class="inline-note">${t("blockNote")}</div><div class="form-grid"><div class="field"><label for="blockSalon">${t("salon")}</label><select class="select" id="blockSalon">${state.salons.map(s => `<option value="${s.id}" ${s.id === d.salonId ? "selected" : ""}>${esc(s.name)}</option>`).join("")}</select></div><div class="field"><label for="blockDate">${t("date")}</label><input class="input" id="blockDate" type="date" value="${d.date}"></div><div class="field"><label for="blockStart">${t("from")}</label><input class="input" id="blockStart" type="time" step="1800" value="${d.start}"></div><div class="field"><label for="blockEnd">${t("until")}</label><input class="input" id="blockEnd" type="time" step="1800" value="${d.end}"></div><div class="field"><label for="blockUnits">${t("capacityToBlock")}</label><select class="select" id="blockUnits">${Array.from({length: conf.capacity}, (_,i) => i+1).map(n => `<option value="${n}" ${n === Number(d.units) ? "selected" : ""}>${t("capacityOf", { used: n, total: conf.capacity })}</option>`).join("")}</select></div><div class="field"><label for="blockReason">${t("reason")}</label><input class="input" id="blockReason" value="${esc(d.reason)}" placeholder="${t("breakReason")}"></div></div>`, foot: `<div class="modal-foot"><button class="secondary-btn" data-action="close-modal">${t("cancel")}</button><button class="primary-btn" data-action="save-block" ${staffActionInFlight ? "disabled" : ""}>${staffActionInFlight ? t("staffWorking") : t("blockTime")}</button></div>` };
}

function blockDetailModal(modal) {
  const b = state.blocks.find(x => x.id === modal.id); if (!b) return { title: t("blockNotFound"), body: "" };
  return { title: b.reason, eyebrow: t("unavailableTime"), body: `<div class="detail-hero"><div class="time-big">${b.start}–${b.end}</div><strong>${esc(fmtDate(b.date))}</strong></div><div class="detail-row"><span>${t("salon")}</span><strong>${esc(salonName(b.salonId))}</strong></div><div class="detail-row"><span>${t("capacityUsed")}</span><strong>${b.units}</strong></div>`, foot: `<div class="modal-foot"><button class="secondary-btn" data-action="close-modal">${t("close")}</button><button class="danger-btn" data-action="delete-block" data-id="${b.id}">${t("removeBlock")}</button></div>` };
}

function daySettingsModal(modal) {
  const d = modal.draft;
  return { title: t("adjustThisDay"), eyebrow: `${salonName(d.salonId)} · ${fmtShortDate(d.date)}`, body: `<div class="inline-note">${t("daySettingsNote")}</div><div class="field"><div class="toggle-line"><span><strong>${t("hoursConfigured")}</strong><span class="microcopy">${t("turnOffTbd")}</span></span><label class="toggle"><input id="dayConfigured" type="checkbox" ${d.configured ? "checked" : ""} aria-label="${t("hoursConfigured")}"><span></span></label></div></div><div class="form-grid"><div class="field"><label for="dayStart">${t("open")}</label><input class="input" id="dayStart" type="time" step="1800" value="${d.start}"></div><div class="field"><label for="dayEnd">${t("closeTime")}</label><input class="input" id="dayEnd" type="time" step="1800" value="${d.end}"></div><div class="field span-2"><label for="dayCapacity">${t("capacity")}</label><select class="select" id="dayCapacity">${[1,2,3,4].map(n => `<option value="${n}" ${n === Number(d.capacity) ? "selected" : ""}>${n === 1 ? t("capacityOne") : t("capacityMany", { count: n })}</option>`).join("")}</select></div></div>`, foot: `<div class="modal-foot"><button class="secondary-btn" data-action="close-modal">${t("cancel")}</button><button class="primary-btn" data-action="save-day-settings" ${staffActionInFlight ? "disabled" : ""}>${staffActionInFlight ? t("staffWorking") : t("saveDay")}</button></div>` };
}

function serviceModal(modal) {
  const d = modal.draft;
  // Root-cause fix: the option list must always include whatever duration the
  // service already has, or the <select> silently shows/saves the first
  // option (30) for any duration not in the hardcoded list (e.g. 5/10/20/35/
  // 40/50 min catalog items), corrupting the duration on an untouched save.
  const durationOptions = [...new Set([5, 10, 15, 20, 30, 35, 40, 45, 50, 60, 75, 90, 105, 120, 150, 180, Number(d.duration)])].filter(n => Number.isFinite(n) && n > 0).sort((a, b) => a - b);
  return { title: modal.isNew ? t("addServiceTitle") : t("editService"), eyebrow: t("servicesAndDuration"), body: `<div class="inline-note">${t("serviceChangeNote")}</div><div class="field"><label for="serviceGroup">${t("serviceType")}</label><input class="input" id="serviceGroup" value="${esc(d.group)}" placeholder="${t("placeholderServiceType")}"></div><div class="field"><label for="serviceName">${t("variantOption")}</label><input class="input" id="serviceName" value="${esc(d.name)}" placeholder="${t("placeholderVariant")}"></div><div class="field"><label for="serviceDuration">${t("duration")}</label><select class="select" id="serviceDuration">${durationOptions.map(n => `<option value="${n}" ${n === Number(d.duration) ? "selected" : ""}>${t("minutes", { count: n })}</option>`).join("")}</select></div><div class="toggle-line"><span><strong>${t("activeForBooking")}</strong><span class="microcopy">${t("inactiveExisting")}</span></span><label class="toggle"><input id="serviceActive" type="checkbox" ${d.active ? "checked" : ""} aria-label="${t("activeForBooking")}"><span></span></label></div>`, foot: `<div class="modal-foot"><button class="secondary-btn" data-action="close-modal">${t("cancel")}</button><button class="primary-btn" data-action="save-service" ${staffActionInFlight ? "disabled" : ""}>${staffActionInFlight ? t("staffWorking") : t("saveService")}</button></div>` };
}


function hoursModal(modal) {
  const dayNames = Array.from({ length: 7 }, (_, i) => new Date(2024, 0, i + 7).toLocaleDateString(uiLocale(), { weekday: "long" })); const d = modal.draft;
  return { title: dayNames[modal.day], eyebrow: `${salonName(ui.salonId)} · ${t("weeklyHoursTitle")}`, body: `<div class="inline-note">${t("hoursNote")}</div><div class="field"><div class="toggle-line"><span><strong>${t("hoursConfigured")}</strong><span class="microcopy">${t("allowBookingWeekday")}</span></span><label class="toggle"><input id="hoursConfigured" type="checkbox" ${d.configured ? "checked" : ""} aria-label="${t("hoursConfigured")}"><span></span></label></div></div><div class="form-grid"><div class="field"><label for="hoursStart">${t("open")}</label><input class="input" id="hoursStart" type="time" step="1800" value="${d.start}"></div><div class="field"><label for="hoursEnd">${t("closeTime")}</label><input class="input" id="hoursEnd" type="time" step="1800" value="${d.end}"></div></div>`, foot: `<div class="modal-foot"><button class="secondary-btn" data-action="close-modal">${t("cancel")}</button><button class="primary-btn" data-action="save-hours" ${staffActionInFlight ? "disabled" : ""}>${staffActionInFlight ? t("staffWorking") : t("saveHours")}</button></div>` };
}

// Click handling

document.addEventListener("click", (event) => {
  // The photo viewer renders in its own layer above the appointment modal and must
  // intercept clicks first: closing it (via backdrop or the × button) should never
  // also dismiss the appointment modal underneath, which stays open and unchanged.
  if (photoViewer) {
    if (event.target.matches("[data-photo-viewer-backdrop]") || event.target.closest("[data-action=\"close-photo-viewer\"]")) {
      closePhotoViewer();
    }
    return;
  }

  // Outside-click dismissal must only run when the backdrop itself is clicked.
  // Using closest() here would treat clicks on form controls as backdrop clicks.
  if (event.target.matches("[data-modal-backdrop]")) {
    ui.modal = null;
    renderModal();
    return;
  }

  const target = event.target.closest("button, [data-action], [data-appointment], [data-edit-service], [data-edit-hours], [data-week-day]");
  if (!target) return;

  if (target.dataset.viewPhoto) {
    const a = apptById(target.dataset.viewPhoto);
    if (a?.photo) openPhotoViewer(a.photo);
    return;
  }
  if (target.dataset.language) { setLanguage(target.dataset.language); return; }
  if (target.dataset.mode) { ui.mode = target.dataset.mode; if (ui.mode === "staff") ui.staffSection = "schedule"; ui.modal = null; syncUrlForMode(ui.mode); render(); return; }
  if (target.dataset.staffSection) { ui.staffSection = target.dataset.staffSection; ui.modal = null; render(); return; }
  if (target.dataset.staffSalon) { ui.salonId = target.dataset.staffSalon; render(); return; }
  if (target.dataset.staffView) { ui.staffView = target.dataset.staffView; render(); return; }
  if (target.dataset.dateMove) { ui.selectedDate = addDays(ui.selectedDate, Number(target.dataset.dateMove)); render(); return; }
  if (target.dataset.customerSalon) {
    // Each salon has its own catalog with its own ids — a previous selection
    // from another location is never valid here, so clear it along with any
    // in-progress manicure add-on picks.
    ui.customer.salonId = target.dataset.customerSalon;
    ui.customer.serviceId = null; ui.customer.pendingManiId = null; ui.customer.addOns = []; ui.customer.length = null; ui.customer.designMode = null;
    ui.customer.date = null; ui.customer.start = null; ui.customer.step = 1; render(); return;
  }
  if (target.dataset.customerService) {
    const svc = remoteServiceById(target.dataset.customerService);
    if (svc && svc.category === "modelace") {
      // Modelace umělých nehtů: reveal the required nail-length step (then optional
      // Zdobení) in place instead of advancing straight to date/time — picking a
      // different modelace variant keeps prior length/add-on choices (they're
      // independent of which variant is chosen).
      ui.customer.pendingManiId = svc.id;
      render();
    } else {
      ui.customer.serviceId = target.dataset.customerService; ui.customer.pendingManiId = null; ui.customer.addOns = []; ui.customer.length = null; ui.customer.designMode = null;
      ui.customer.date = null; ui.customer.start = null; ui.customer.step = 2; render();
    }
    return;
  }
  if (target.dataset.customerLength) {
    ui.customer.length = target.dataset.customerLength;
    render();
    return;
  }
  // Restored (an earlier change mistakenly deleted these entirely). "combo"'s
  // add-on gating below is tightened relative to the original version: only
  // "design" lets a chip toggle add-ons now, since "combo" no longer renders
  // any Zdobení add-on chips at all (see renderManiAddOns()/showDesignFlow).
  if (target.dataset.customerDesignMode) {
    const mode = target.dataset.customerDesignMode;
    ui.customer.designMode = mode;
    // Clear state that's incompatible with the newly chosen mode so nothing
    // stale (an old design pick or reference photo) silently survives a mode
    // switch: "no design" never carries chosen Zdobení designs, "design"
    // offers no reference photo (so leaving an old one behind clears it),
    // and "combo" no longer offers any Zdobení add-on picker at all (so any
    // previously chosen designs must never silently ride along into a combo
    // submission).
    if (mode === "none") { ui.customer.addOns = []; ui.customer.photo = null; }
    else if (mode === "design") { ui.customer.photo = null; }
    else if (mode === "combo") { ui.customer.addOns = []; }
    render();
    return;
  }
  if (target.dataset.customerAddon) {
    // Defensive guard mirroring the panel's own gating: Zdobení chips only
    // render for "design" mode now ("combo" no longer offers them) — strict
    // allow-list, not just "not none", so an invalid/tampered designMode (or
    // a stale click target for the no-longer-rendered combo add-on panel)
    // can never accumulate add-on state either.
    if (ui.customer.designMode !== "design") return;
    const id = target.dataset.customerAddon;
    const idx = ui.customer.addOns.indexOf(id);
    if (idx === -1) ui.customer.addOns.push(id); else ui.customer.addOns.splice(idx, 1);
    render();
    return;
  }
  if (target.dataset.manualLength && ui.modal?.type === "manual") {
    ui.modal.draft.length = target.dataset.manualLength;
    ui.modal.draft.time = null;
    renderModal();
    return;
  }
  if (target.dataset.manualAddon && ui.modal?.type === "manual") {
    const id = target.dataset.manualAddon;
    const draft = ui.modal.draft;
    const idx = draft.addOns.indexOf(id);
    if (idx === -1) draft.addOns.push(id); else draft.addOns.splice(idx, 1);
    draft.time = null;
    renderModal();
    return;
  }
  if (target.dataset.customerDate) { ui.customer.date = target.dataset.customerDate; ui.customer.start = null; render(); return; }
  if (target.dataset.customerTime) { ui.customer.start = target.dataset.customerTime; ui.customer.step = 3; render(); setTimeout(() => $("#customerName")?.focus(), 50); return; }
  if (target.dataset.appointment) { event.stopPropagation(); ui.modal = { type: "appointment", id: target.dataset.appointment }; renderModal(); return; }
  if (target.dataset.block) { ui.modal = { type: "block-detail", id: target.dataset.block }; renderModal(); return; }
  if (target.dataset.weekDay && !event.target.closest("[data-appointment]")) { ui.selectedDate = target.dataset.weekDay; ui.staffView = "day"; render(); return; }
  if (target.dataset.monthDay) { ui.selectedDate = target.dataset.monthDay; ui.staffView = "day"; render(); return; }
  if (target.dataset.editService) { openService(target.dataset.editService); return; }
  if (target.dataset.editHours !== undefined) { openHours(Number(target.dataset.editHours)); return; }
  if (target.dataset.rescheduleTime) { ui.modal.time = target.dataset.rescheduleTime; renderModal(); return; }

  const action = target.dataset.action;
  if (!action) return;
  if (action === "go-staff") {
    // Phase 3D Issue 1: this is the brand/logo button, shared by both
    // surfaces. It used to force staff mode unconditionally, which meant a
    // customer could reach the staff login screen just by clicking the
    // logo. It now only acts as a "staff home" shortcut while already
    // inside the staff surface; from customer mode it resets the booking
    // flow back to its first step instead of ever navigating to staff.
    if (ui.mode === "staff") { ui.staffSection = "schedule"; render(); }
    else { ui.customer = freshCustomer(); render(); }
  }
  if (action === "customer-back") {
    syncCustomerFields();
    if (ui.customer.step - 1 === 1) reopenManiAddOnsIfNeeded();
    ui.customer.step = Math.max(0, ui.customer.step - 1); render();
  }
  if (action === "change-service") { reopenManiAddOnsIfNeeded(); ui.customer.step = 1; render(); }
  if (action === "continue-manicure") {
    // Restored (an earlier change mistakenly dropped the design-mode part of
    // this guard): a nail length AND a STRICTLY valid design mode
    // ("none"/"design"/"combo" — not just any truthy value) are required for
    // Modelace umělých nehtů before continuing to date/time — this can never
    // be bypassed via a stale/direct click on a disabled button, a
    // tampered designMode, or a race with the panel's own gating.
    const pendingSvc = remoteServiceById(ui.customer.pendingManiId);
    if (pendingSvc && pendingSvc.category === "modelace" && (!ui.customer.length || !isValidDesignMode(ui.customer.designMode))) return;
    // P1: "Design + inspiration" also needs its reference photo before moving on.
    if (pendingSvc && pendingSvc.category === "modelace" && designModeRequiresPhoto(ui.customer.designMode) && !ui.customer.photo) {
      showToast(t("photoRequiredMessage"));
      return;
    }
    ui.customer.serviceId = ui.customer.pendingManiId;
    ui.customer.date = null; ui.customer.start = null;
    ui.customer.step = 2; render();
  }
  if (action === "retry-catalog") { forceReloadRemoteCatalog(render); render(); }
  if (action === "retry-availability") {
    const c = ui.customer;
    const service = remoteServiceById(c.serviceId);
    if (service && c.date) forceReloadRemoteAvailability(c.salonId, c.date, remoteCustomerBookingDuration(c, service), render);
    render();
  }
  if (action === "customer-details-next") customerDetailsNext();
  if (action === "remove-customer-photo") { syncCustomerFields(); ui.customer.photo = null; render(); }
  if (action === "confirm-booking") confirmCustomerBooking();
  if (action === "book-another") { ui.customer = freshCustomer(); render(); }
  if (action === "view-in-calendar") viewConfirmedInCalendar();
  // Phase 3C: self-cancellation screen navigation/actions. These only ever
  // touch the new cancelX/view fields on ui.customer (see freshCustomer()) —
  // an in-progress booking draft's own fields (name/phone/date/etc.) are
  // left completely alone by all four of these.
  if (action === "open-cancel-lookup") {
    const c = ui.customer;
    c.view = "cancel"; c.cancelAppointmentId = ""; c.cancelPhone = ""; c.cancelStatus = "idle"; c.cancelError = null; c.cancelResult = null;
    render();
  }
  if (action === "go-cancel-this-booking") {
    const c = ui.customer;
    c.view = "cancel"; c.cancelAppointmentId = target.dataset.id || ""; c.cancelPhone = ""; c.cancelStatus = "idle"; c.cancelError = null; c.cancelResult = null;
    render();
  }
  if (action === "cancel-lookup-back") { ui.customer.view = "book"; render(); }
  if (action === "submit-cancel-lookup") submitCancelLookup();
  if (action === "cancel-lookup-done") { ui.customer = freshCustomer(); render(); }
  if (action === "go-today") { ui.selectedDate = todayISO(); render(); }
  if (action === "open-manual") openManual();
  if (action === "open-block") openBlock();
  if (action === "open-day-settings") openDaySettings();
  if (action === "close-modal") { ui.modal = null; renderModal(); }
  if (action === "open-cancel") { ui.modal = { type: "cancel", id: target.dataset.id }; renderModal(); }
  if (action === "confirm-cancel") cancelAppointment(target.dataset.id);
  if (action === "open-reschedule") openReschedule(target.dataset.id);
  if (action === "save-reschedule") saveReschedule(target.dataset.id);
  if (action === "open-edit-appointment") { ui.modal = { type: "edit-appointment", id: target.dataset.id }; renderModal(); }
  if (action === "save-edit-appointment") saveEditAppointment(target.dataset.id);
  if (action === "save-manual") saveManual();
  if (action === "save-block") saveBlock();
  if (action === "delete-block") deleteBlock(target.dataset.id);
  if (action === "save-day-settings") saveDaySettings();
  if (action === "add-service") openService();
  if (action === "save-service") saveService();
  if (action === "save-hours") saveHours();
  if (action === "staff-sign-in") staffLoginSubmit();
  if (action === "staff-sign-out") staffLogout();
  if (action === "staff-retry-load") { forceReloadStaffData(ui.selectedDate, render); render(); }
});

document.addEventListener("change", (event) => {
  const id = event.target.id;
  if (id === "rescheduleDate" && ui.modal?.type === "reschedule") { ui.modal.date = event.target.value; ui.modal.time = null; renderModal(); }
  if (["manualSalon", "manualService", "manualDate"].includes(id) && ui.modal?.type === "manual") {
    const draft = ui.modal.draft;
    const prevSalonId = draft.salonId;
    draft.salonId = $("#manualSalon").value;
    draft.serviceId = $("#manualService").value;
    draft.date = $("#manualDate").value;
    draft.name = $("#manualName")?.value ?? draft.name;
    draft.phone = $("#manualPhone")?.value ?? draft.phone;
    draft.instagram = $("#manualInstagram")?.value ?? draft.instagram;
    draft.reminder = $("#manualReminder")?.checked ?? draft.reminder;
    draft.time = null;
    // Zdobení add-on ids are salon-scoped, and length/add-ons only apply to
    // Modelace umělých nehtů — clear them whenever the salon changes or the
    // newly selected service isn't Modelace, exactly like the customer flow.
    // Switching between Modelace variants at the same salon keeps them.
    const newService = serviceById(draft.serviceId);
    if (draft.salonId !== prevSalonId || newService?.category !== "modelace") {
      draft.length = null; draft.addOns = [];
    }
    renderModal();
  }
  if (id === "manualTime" && ui.modal?.type === "manual") ui.modal.draft.time = event.target.value;
  if (id === "customerPhotoInput") {
    const file = event.target.files?.[0];
    syncCustomerFields();
    handlePhotoFile(file, (dataUrl) => { ui.customer.photo = dataUrl; render(); });
  }
  if (["blockSalon", "blockDate"].includes(id) && ui.modal?.type === "block") {
    const draft = ui.modal.draft;
    draft.salonId = $("#blockSalon").value;
    draft.date = $("#blockDate").value;
    draft.start = $("#blockStart")?.value ?? draft.start;
    draft.end = $("#blockEnd")?.value ?? draft.end;
    draft.units = 1;
    draft.reason = $("#blockReason")?.value ?? draft.reason;
    renderModal();
  }
});

document.addEventListener("keydown", (event) => {
  // Escape closes only the topmost layer: if the photo viewer is open it closes
  // that and leaves the appointment modal untouched underneath.
  if (photoViewer) {
    if (event.key === "Escape") { event.preventDefault(); closePhotoViewer(); }
    return;
  }
  if (!ui.modal) return;
  if (event.key === "Escape") {
    event.preventDefault();
    ui.modal = null;
    renderModal();
    return;
  }
  if (event.key !== "Tab") return;
  const dialog = $("#modalRoot .modal");
  const focusable = $$('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])', dialog)
    .filter(node => node.offsetParent !== null);
  if (!focusable.length) return;
  const first = focusable[0], last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

// Enter-to-submit convenience on the staff login fields (the rest of the app
// has no <form> elements, so this is a small standalone listener rather than
// a submit handler).
document.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  if (event.target?.id === "staffLoginEmail" || event.target?.id === "staffLoginPassword") {
    event.preventDefault();
    staffLoginSubmit();
  }
});

$("#resetDemo").addEventListener("click", () => {
  if (!window.confirm(t("resetConfirm"))) return;
  localStorage.removeItem(STORAGE_KEY); state = createDemoState(); ui.customer = freshCustomer(); ui.selectedDate = todayISO(); ui.modal = null; saveState(); render(); showToast(t("demoRestored"));
});

// Fires only in *other* same-origin tabs when one of them writes to
// localStorage — used here to keep this tab's in-memory state from drifting
// stale relative to bookings/changes made elsewhere (e.g. a client confirming
// in one tab while staff have this app open in another). Skipped while the
// user is actively typing into a text field so a background sync never wipes
// out in-progress keystrokes in an uncontrolled input (this app already
// re-renders its whole DOM from state on most interactions, same as here).
window.addEventListener("storage", (event) => {
  if (event.key !== STORAGE_KEY) return;
  if (!reloadPersistedState()) return;
  const activeTag = document.activeElement?.tagName;
  const isTyping = activeTag === "INPUT" || activeTag === "TEXTAREA";
  if (isTyping) return;
  render();
});

function syncCustomerFields() {
  if (ui.customer.step !== 3) return;
  ui.customer.name = $("#customerName")?.value.trim() || ui.customer.name;
  ui.customer.phone = $("#customerPhone")?.value.trim() ?? ui.customer.phone;
  ui.customer.instagram = $("#customerInstagram")?.value.trim() ?? ui.customer.instagram;
  ui.customer.reminder = $("#customerReminder")?.checked ?? ui.customer.reminder;
  ui.customer.notes = $("#customerNotes")?.value.trim() ?? ui.customer.notes;
}
function customerDetailsNext() {
  syncCustomerFields();
  const c = ui.customer;
  if (!c.name || !c.phone) { showToast(t("requiredContact")); return; }
  if (!isValidName(c.name)) { showToast(t("invalidName")); return; }
  if (!isValidPhone(c.phone)) { showToast(t("invalidPhone")); return; }
  // Operator requirement: Instagram is optional. An empty value skips format
  // validation entirely and proceeds; if the customer DID type something, the
  // existing format rule still applies unchanged.
  if (c.instagram && !isValidInstagram(c.instagram)) { showToast(t("invalidInstagram")); return; }
  ui.customer.step = 4; render();
}
// Maps the raw row returned by the real create_customer_booking RPC
// (snake_case Postgres columns) into the shape the confirmation screen
// already expects. localPhoto is the browser's own in-memory data URL
// (c.photo) — the server never returns the photo itself (it's a private,
// write-only Storage object the customer can't read back), but the browser
// already has it, so the confirmation screen can still show the same
// thumbnail the customer picked without any extra round trip.
function mapRemoteAppointment(row, localPhoto) {
  return {
    // Phase 3C: the row's real id, now forwarded so the confirmation screen
    // can show it as the customer's cancellation reference (see
    // cancel_appointment_customer's ownership model — appointment id +
    // booking phone number). Purely additive: nothing before this phase
    // read an .id off this mapped object.
    id: row.id,
    salonId: row.salon_id,
    serviceName: row.service_name_snapshot,
    duration: row.duration_minutes,
    date: row.appointment_date,
    start: String(row.start_time).slice(0, 5),
    end: String(row.end_time).slice(0, 5),
    category: row.category_snapshot,
    length: row.length_key,
    addOns: row.add_ons_snapshot || [],
    name: row.customer_name,
    phone: row.customer_phone,
    instagram: row.customer_instagram,
    notes: row.customer_notes,
    photo: localPhoto || null,
  };
}

// Phase 3A: the ONLY write path for a customer booking is now the real
// create_customer_booking RPC (see supabase-client.js createRemoteCustomerBooking).
// Every business rule (contact validation, Modelace length/design-mode rule,
// duration/price snapshot, capacity) is re-validated and computed
// server-side; nothing here is trusted for correctness, only for UX (picking
// what to submit and how to react to the result). The old localStorage
// withBookingLock/reloadPersistedState path is gone for the customer flow —
// there is no local write left to race, and the server's own
// pg_advisory_xact_lock is the real cross-device serialization.
function confirmCustomerBooking() {
  const c = ui.customer;
  if (customerBookingInFlight) return;
  const service = remoteServiceById(c.serviceId);
  if (!service) { showToast(t("slotUnavailable")); render(); return; }
  // Restored (an earlier change mistakenly dropped the design-mode part of
  // this guard): Modelace umělých nehtů can never confirm without a length
  // AND a STRICTLY valid design mode ("none"/"design"/"combo"), mirroring
  // the panel's own gating and the continue-manicure guard above —
  // belt-and-braces against any path that reached review without going
  // through the normal in-panel flow, including a tampered/arbitrary
  // designMode value. The server re-checks this exact rule again regardless
  // (N2D05/N2D06).
  if (service.category === "modelace" && (!c.length || !isValidDesignMode(c.designMode))) { showToast(t("slotUnavailable")); render(); return; }
  // P1 defensive check (frontend only; the backend must enforce this too — see
  // the P1 report): "Design + inspiration" is never submitted without a photo.
  // Checked before the in-flight flag, the upload, and the RPC.
  const photoRequired = service.category === "modelace" && designModeRequiresPhoto(c.designMode);
  if (photoRequired && !c.photo) { showToast(t("photoRequiredMessage")); render(); return; }

  customerBookingInFlight = true;
  render(); // reflect the disabled/"submitting" button state immediately

  // designModeIncludesAddOns() now excludes "combo" (see its definition):
  // a combo submission always sends zero add-ons, matching the simplified
  // sub-flow exactly — never a fabricated selection, never a stale one left
  // over from switching modes (also defensively cleared on mode-switch, see
  // the data-customer-design-mode handler above).
  const chosenAddOnIds = designModeIncludesAddOns(c.designMode) ? (c.addOns || []) : [];
  const localPhoto = c.photo || null;

  (async () => {
    let referencePhotoPath = null;
    try {
      if (localPhoto) {
        referencePhotoPath = await uploadReferencePhoto(localPhoto);
      }
    } catch (photoErr) {
      console.warn("Reference photo upload failed", photoErr);
      customerBookingInFlight = false;
      // Required-photo mode must not suggest continuing without a photo.
      showToast(t(photoRequired ? "photoUploadErrorRequired" : "photoUploadError"));
      render();
      return;
    }
    // P1: in required-photo mode the booking RPC is never called without a stored path.
    if (photoRequired && !referencePhotoPath) {
      customerBookingInFlight = false;
      showToast(t("photoUploadErrorRequired"));
      render();
      return;
    }

    try {
      const row = await createRemoteCustomerBooking({
        salonId: c.salonId,
        serviceId: service.id,
        date: c.date,
        start: c.start,
        lengthKey: service.category === "modelace" ? (c.length || null) : null,
        // Restored: submit the customer's actual chosen design mode again
        // (not a forced 'none') — "none"/"design"/"combo" all pass through
        // as chosen. Add-ons are whatever designModeIncludesAddOns() allows
        // (now "design" only; "combo" always sends none — see above).
        designMode: service.category === "modelace" ? c.designMode : null,
        addOnIds: chosenAddOnIds,
        name: c.name,
        phone: c.phone,
        instagram: c.instagram,
        notes: c.notes || null,
        reminder: !!c.reminder,
        referencePhotoPath,
      });
      invalidateRemoteAvailability(c.salonId, c.date);
      customerBookingInFlight = false;
      c.confirmedAppointment = mapRemoteAppointment(row, localPhoto);
      c.step = 5;
      render();
    } catch (err) {
      customerBookingInFlight = false;
      invalidateRemoteAvailability(c.salonId, c.date);
      console.warn("Booking confirmation failed", err);
      // N2D08 slot_unavailable — someone else booked it first (or it fell out
      // of hours) between browsing and confirming; the server is the one
      // authority that matters, so send the customer back to a freshly
      // reloaded step 2 exactly like the old cross-tab conflict path did.
      if (err?.code === "N2D08") {
        c.step = 2; c.start = null; render(); showToast(t("slotUnavailable"));
      } else {
        render();
        showToast(t("bookingNetworkError"));
      }
    }
  })();
}

// ---------------------------------------------------------------------------
// Phase 3C — customer self-cancellation submit handler. Calls the existing
// cancel_appointment_customer RPC (via cancelRemoteCustomerBooking in
// supabase-client.js); every real decision (does the id+phone match a real
// appointment, is it already cancelled, is it inside the 2-hour cutoff) is
// made server-side. This function only reads the two form inputs, shows the
// in-flight/result state, and maps the server's response/error onto the
// screen — it never computes or pre-empts the cutoff itself.
// ---------------------------------------------------------------------------
function submitCancelLookup() {
  const c = ui.customer;
  if (cancelLookupInFlight) return;
  c.cancelAppointmentId = $("#cancelAppointmentId")?.value.trim() || "";
  c.cancelPhone = $("#cancelPhoneInput")?.value.trim() || "";
  if (!c.cancelAppointmentId || !c.cancelPhone) { showToast(t("requiredContact")); return; }
  // UX-only: catches obvious typos before a round-trip. The server
  // (cancel_appointment_customer) re-normalizes and is the only authority
  // on whether the phone actually matches the booking.
  if (!isValidPhone(c.cancelPhone)) { showToast(t("invalidPhone")); return; }

  cancelLookupInFlight = true;
  c.cancelStatus = "loading";
  render();

  (async () => {
    try {
      const row = await cancelRemoteCustomerBooking(c.cancelAppointmentId, c.cancelPhone);
      cancelLookupInFlight = false;
      c.cancelStatus = "success";
      c.cancelResult = mapRemoteAppointment(row, null);
      render();
    } catch (err) {
      cancelLookupInFlight = false;
      c.cancelStatus = "error";
      console.warn("Customer self-cancellation failed", err);
      if (err?.code === "N2D09") c.cancelError = "notFound";
      else if (err?.code === "N2D11") c.cancelError = "alreadyCancelled";
      else if (err?.code === "N2D10") c.cancelError = "windowClosed";
      else c.cancelError = "network";
      render();
    }
  })();
}

function viewConfirmedInCalendar() {
  const a = apptById(ui.customer.confirmedId); if (!a) return;
  ui.mode = "staff"; ui.staffSection = "schedule"; ui.staffView = "day"; ui.salonId = a.salonId; ui.selectedDate = a.date; render(); setTimeout(() => { ui.modal = { type: "appointment", id: a.id }; renderModal(); }, 150);
}

function openManual() {
  const service = state.services.find(s => s.active && s.salonId === ui.salonId);
  ui.modal = { type: "manual", draft: { salonId: ui.salonId, serviceId: service?.id, date: ui.selectedDate, time: null, length: null, addOns: [], name: "", phone: "", instagram: "", notes: "", reminder: true } }; renderModal();
}
function saveManual() {
  if (manualBookingInFlight) return;
  const d = ui.modal.draft; const service = serviceById(d.serviceId);
  d.time = $("#manualTime")?.value || d.time; d.name = $("#manualName").value.trim(); d.phone = $("#manualPhone").value.trim(); d.instagram = $("#manualInstagram").value.trim(); d.notes = $("#manualNotes")?.value.trim() ?? d.notes; d.reminder = $("#manualReminder").checked;
  // P1: Instagram is optional for staff too. Phone stays required. Format is
  // checked only when a value was typed, using the same rule as the customer flow.
  if (!service || !d.name || !d.phone || !d.time) { showToast(t("manualRequired")); return; }
  if (d.instagram && !isValidInstagram(d.instagram)) { showToast(t("invalidInstagram")); return; }
  // Same required-length rule as the customer flow: Modelace umělých nehtů
  // can't be booked (manually or otherwise) without a chosen nail length.
  if (service.category === "modelace" && !d.length) { showToast(t("manualLengthRequired")); renderModal(); return; }
  manualBookingInFlight = true; renderModal();
  // Phase 3B: the local availableSlots()/uid()/state.push() write is gone —
  // create_staff_booking() is now the sole, server-authoritative writer. It
  // re-validates contact fields, re-derives duration/price from the live
  // catalog, and takes the same advisory lock + capacity re-check every
  // other booking path uses, so this can never race with another device.
  staffCreateBooking({
    salonId: d.salonId, serviceId: d.serviceId, date: d.date, start: d.time,
    lengthKey: service.category === "modelace" ? d.length : null,
    addOnIds: d.addOns || [], name: d.name, phone: d.phone, instagram: d.instagram, notes: d.notes, reminder: d.reminder,
  }).then(() => {
    manualBookingInFlight = false;
    ui.salonId = d.salonId; ui.selectedDate = d.date; ui.staffSection = "schedule"; ui.staffView = "day"; ui.modal = null;
    forceReloadStaffData(d.date, render); render(); showToast(t("bookingAdded"));
  }).catch((err) => {
    manualBookingInFlight = false;
    console.warn("Manual booking failed", err);
    if (err?.code === "N2D08") { showToast(t("timeNoLongerAvailable")); forceReloadStaffData(d.date, render); }
    else if (err?.code === "42501") { showToast(t("staffAccessDeniedTitle")); staffLogout(); return; }
    else showToast(t("staffActionFailed"));
    renderModal();
  });
}
function cancelAppointment(id) {
  if (staffActionInFlight) return;
  const a = apptById(id); if (!a) return;
  staffActionInFlight = true; renderModal();
  staffCancelAppointment(id).then(() => {
    staffActionInFlight = false;
    if (ui.customer.confirmedId === id) ui.customer = freshCustomer();
    ui.modal = null;
    forceReloadStaffData(a.date, render); render(); showToast(t("timeAvailableAgain", { start: a.start, end: a.end }));
  }).catch((err) => {
    staffActionInFlight = false;
    console.warn("Cancel failed", err);
    if (err?.code === "N2D09") { showToast(t("staffActionFailed")); ui.modal = null; forceReloadStaffData(a.date, render); render(); return; }
    if (err?.code === "42501") { showToast(t("staffAccessDeniedTitle")); staffLogout(); return; }
    showToast(t("staffActionFailed")); renderModal();
  });
}
function openReschedule(id) {
  const a = apptById(id); ui.modal = { type: "reschedule", id, date: a.date, time: null }; renderModal();
}
function saveReschedule(id) {
  if (staffActionInFlight) return;
  const a = apptById(id), m = ui.modal;
  if (!m.time || !availableSlots(a.salonId, m.date, a.duration, a.id).includes(m.time)) { showToast(t("chooseAvailableTime")); return; }
  const old = `${fmtShortDate(a.date)} ${a.start}`;
  staffActionInFlight = true; renderModal();
  // Phase 3B: reschedule_appointment_staff() re-checks capacity for the NEW
  // slot under the same advisory lock every other booking write uses — the
  // local availableSlots() check above is only for the UI's own slot picker,
  // never the final authority.
  staffRescheduleAppointment(id, m.date, m.time).then(() => {
    staffActionInFlight = false;
    ui.selectedDate = m.date; ui.salonId = a.salonId; ui.staffView = "day"; ui.modal = null;
    forceReloadStaffData(m.date, render); render(); showToast(t("movedReleased", { old }));
  }).catch((err) => {
    staffActionInFlight = false;
    console.warn("Reschedule failed", err);
    if (err?.code === "N2D08") { showToast(t("chooseAvailableTime")); forceReloadStaffData(m.date, render); }
    else if (err?.code === "42501") { showToast(t("staffAccessDeniedTitle")); staffLogout(); return; }
    else showToast(t("staffActionFailed"));
    renderModal();
  });
}
function saveEditAppointment(id) {
  if (staffActionInFlight) return;
  const a = apptById(id); const name = $("#editName").value.trim(), phone = $("#editPhone").value.trim(), instagram = $("#editInstagram").value.trim(), notes = $("#editNotes")?.value.trim() ?? (a.notes || ""), reminder = $("#editReminder").checked;
  if (!name || !phone) { showToast(t("nameContactRequired")); return; }
  // P1: Instagram is optional. Format is checked only when the value was changed
  // to a non-empty string, so an older stored value never blocks unrelated edits.
  if (instagram && instagram !== (a.instagram || "") && !isValidInstagram(instagram)) { showToast(t("invalidInstagram")); return; }
  // Empty + nothing stored: leave the column untouched (no null-to-"" change, no
  // fake value). Empty + something stored: an explicit clear, sent as "".
  const instagramUpdate = (instagram || a.instagram) ? instagram : undefined;
  staffActionInFlight = true; renderModal();
  staffUpdateAppointmentContact(id, { name, phone, instagram: instagramUpdate, notes, reminder }).then(() => {
    staffActionInFlight = false;
    ui.modal = null; forceReloadStaffData(a.date, render); render(); showToast(t("detailsUpdated"));
  }).catch((err) => {
    staffActionInFlight = false;
    console.warn("Edit appointment failed", err);
    if (err?.code === "42501") { showToast(t("staffAccessDeniedTitle")); staffLogout(); return; }
    showToast(t("staffActionFailed")); renderModal();
  });
}
function openBlock() {
  const conf = getDayConfig(ui.salonId, ui.selectedDate);
  ui.modal = { type: "block", draft: { salonId: ui.salonId, date: ui.selectedDate, start: conf.start || "09:00", end: addMinutes(conf.start || "09:00", 60), units: 1, reason: "Break" } }; renderModal();
}
function saveBlock() {
  if (staffActionInFlight) return;
  const d = ui.modal.draft; d.start = $("#blockStart").value; d.end = $("#blockEnd").value; d.units = Number($("#blockUnits").value); d.reason = $("#blockReason").value.trim() || "Unavailable";
  if (minFromTime(d.end) <= minFromTime(d.start)) { showToast(t("endAfterStart")); return; }
  const conf = getDayConfig(d.salonId, d.date); d.units = Math.min(d.units, conf.capacity);
  staffActionInFlight = true; renderModal();
  staffCreateBlock(d).then(() => {
    staffActionInFlight = false;
    ui.salonId = d.salonId; ui.selectedDate = d.date; ui.staffSection = "schedule"; ui.staffView = "day"; ui.modal = null;
    forceReloadStaffData(d.date, render); render(); showToast(t("blockedSuccess"));
  }).catch((err) => {
    staffActionInFlight = false;
    console.warn("Block failed", err);
    if (err?.code === "42501") { showToast(t("staffAccessDeniedTitle")); staffLogout(); return; }
    showToast(t("staffActionFailed")); renderModal();
  });
}
function deleteBlock(id) {
  if (staffActionInFlight) return;
  const date = ui.selectedDate;
  staffActionInFlight = true; renderModal();
  staffDeleteBlock(id).then(() => {
    staffActionInFlight = false;
    ui.modal = null; forceReloadStaffData(date, render); render(); showToast(t("blockRemoved"));
  }).catch((err) => {
    staffActionInFlight = false;
    console.warn("Delete block failed", err);
    if (err?.code === "42501") { showToast(t("staffAccessDeniedTitle")); staffLogout(); return; }
    showToast(t("staffActionFailed")); renderModal();
  });
}
function openDaySettings() {
  const d = getDayConfig(ui.salonId, ui.selectedDate); ui.modal = { type: "day-settings", draft: { salonId: ui.salonId, date: ui.selectedDate, ...d } }; renderModal();
}
function saveDaySettings() {
  if (staffActionInFlight) return;
  const d = ui.modal.draft; const configured = $("#dayConfigured").checked, start = $("#dayStart").value, end = $("#dayEnd").value, capacity = Number($("#dayCapacity").value);
  if (configured && minFromTime(end) <= minFromTime(start)) { showToast(t("closingAfterOpening")); return; }
  staffActionInFlight = true; renderModal();
  staffUpsertDayOverride({ salonId: d.salonId, date: d.date, configured, start, end, capacity }).then(() => {
    staffActionInFlight = false;
    ui.modal = null; forceReloadStaffData(d.date, render); render(); showToast(t("dailyUpdated"));
  }).catch((err) => {
    staffActionInFlight = false;
    console.warn("Day settings failed", err);
    if (err?.code === "42501") { showToast(t("staffAccessDeniedTitle")); staffLogout(); return; }
    showToast(t("staffActionFailed")); renderModal();
  });
}
function openService(id = null) {
  const s = id ? serviceById(id) : null;
  // New ad-hoc services attach to whichever salon tab is currently open in
  // Setup; existing services keep whatever salon they already belong to.
  // price/priceFrom/priceLabel are set explicitly (not left undefined) so a
  // staff-created service always has a valid numeric price to render.
  ui.modal = { type: "service", id, isNew: !s, draft: s ? { ...s } : { group: "", name: "", duration: 60, active: true, color: (state.services.length % 4) + 1, salonId: ui.salonId, price: 0, priceFrom: false, priceLabel: null } }; renderModal();
}
function saveService() {
  if (staffActionInFlight) return;
  const d = ui.modal.draft; d.group = $("#serviceGroup").value.trim(); d.name = $("#serviceName").value.trim(); d.active = $("#serviceActive").checked;
  // Defensive fallbacks: 30 min / 0 Kč are only used if the read value is
  // genuinely missing or invalid, never overriding a real configured value.
  const parsedDuration = Number($("#serviceDuration").value);
  d.duration = Number.isFinite(parsedDuration) && parsedDuration > 0 ? parsedDuration : 30;
  d.price = Number.isFinite(Number(d.price)) ? Number(d.price) : 0;
  if (!d.group || !d.name) { showToast(t("serviceNameRequired")); return; }
  staffActionInFlight = true; renderModal();
  staffUpsertService(state.services, d, ui.modal.isNew).then(() => {
    staffActionInFlight = false;
    ui.modal = null; forceReloadStaffData(ui.selectedDate, render); render(); showToast(t("serviceSaved"));
  }).catch((err) => {
    staffActionInFlight = false;
    console.warn("Save service failed", err);
    if (err?.code === "42501") { showToast(t("staffAccessDeniedTitle")); staffLogout(); return; }
    showToast(t("staffActionFailed")); renderModal();
  });
}
function openHours(day) {
  const h = state.salons.find(s => s.id === ui.salonId).hours[day]; ui.modal = { type: "hours", day, draft: { ...h } }; renderModal();
}
function saveHours() {
  if (staffActionInFlight) return;
  const m = ui.modal; const configured = $("#hoursConfigured").checked, start = $("#hoursStart").value, end = $("#hoursEnd").value;
  if (configured && minFromTime(end) <= minFromTime(start)) { showToast(t("closingAfterOpening")); return; }
  staffActionInFlight = true; renderModal();
  staffUpsertSalonHours(ui.salonId, m.day, { configured, start, end }).then(() => {
    staffActionInFlight = false;
    ui.modal = null; forceReloadStaffData(ui.selectedDate, render); render(); showToast(t("weeklyUpdated"));
  }).catch((err) => {
    staffActionInFlight = false;
    console.warn("Save hours failed", err);
    if (err?.code === "42501") { showToast(t("staffAccessDeniedTitle")); staffLogout(); return; }
    showToast(t("staffActionFailed")); renderModal();
  });
}

// ---------------------------------------------------------------------------
// Phase 3B staff auth actions
// ---------------------------------------------------------------------------
function staffLoginSubmit() {
  if (staffActionInFlight) return;
  const email = $("#staffLoginEmail")?.value.trim(), password = $("#staffLoginPassword")?.value;
  if (!email || !password) { showToast(t("staffLoginRequired")); return; }
  staffActionInFlight = true; render();
  staffSignIn(email, password).then(() => {
    staffActionInFlight = false;
    render();
  }).catch((err) => {
    console.warn("Staff sign-in failed", err);
    staffActionInFlight = false;
    render();
  });
}
function staffLogout() {
  staffActionInFlight = false;
  ui.modal = null;
  staffSignOut().then(render);
}

// Re-renders automatically whenever Supabase Auth's own session state
// changes for any reason (sign-in/out completing, a token refresh, or the
// session simply expiring while the tab is open) — not just in direct
// response to a button click here.
if (typeof onStaffAuthChange === "function") onStaffAuthChange(() => render());

// Phase 3D Issue 1: keep the rendered surface in sync with browser
// back/forward navigation between "/" and "/staff" (pushed by
// syncUrlForMode above). This only ever changes which screen renders —
// staff data access is still fully gated by renderStaff()'s own
// auth/authorization checks and, ultimately, Supabase RLS.
window.addEventListener("popstate", () => { ui.mode = initialModeFromPath(); ui.modal = null; render(); });

render();

