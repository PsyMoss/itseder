export type CardType = 'service' | 'product';

export interface ServiceCard {
  id: string;
  color?: 'acc' | 'acc2' | 'acc3';
  tag: { he: string; ru: string; en: string };
  h: { he: string; ru: string; en: string };
  p: { he: string; ru: string; en: string };
  li?: { he: string; ru: string; en: string }[];
  grid?: { he: [string,string]; ru: [string,string]; en: [string,string] }[];
  image?: string;
  video?: string;
}

export const CARDS: ServiceCard[] = [
  {
    id: 'pc',
    tag: { he:'שירותים נפוצים', ru:'Самое популярное', en:'Most popular' },
    h:   { he:'הגדרת מחשב', ru:'Настройка ПК', en:'PC Setup' },
    p:   { he:'תיקונים, שידרוגים וייעוץ למחשבים ביתיים ומשרדיים', ru:'Домашние и офисные компьютеры — от распаковки до полной работы', en:'Home & office computers — repairs, upgrades and advice' },
    li:  [
      { he:'הגדרת Windows / macOS', ru:'Настройка Windows / macOS', en:'Windows / macOS setup' },
      { he:'התקנה ורישוי תוכנות', ru:'Установка и лицензирование ПО', en:'Software & licensing' },
      { he:'רשת ומדפסות', ru:'Сеть и принтеры', en:'Network & printers' },
      { he:'העברת נתונים', ru:'Перенос данных', en:'Data migration' },
    ],
    image: '/images/pc.avif',
    video: '/videos/pc.mp4',
  },
  {
    id: 'office',
    tag: { he:'שירות מקיף למשרד', ru:'Лучшая ценность', en:'Best value' },
    h:   { he:'משרד עד המפתח', ru:'Офис под ключ', en:'Office Turnkey' },
    p:   { he:'משרד חדש? הגדרה/התקנת כל הנדרש לתחילת עבודה מיידית', ru:'Новый офис? Настрою всё так, чтобы сотрудники сразу работали', en:'New office? I set up everything so your team works from day one' },
    li:  [
      { he:'תחנות עבודה לכל העובדים', ru:'Рабочие места для всех', en:'Workstations for all staff' },
      { he:'תשתית רשת ו-Wi-Fi', ru:'Сеть и Wi-Fi', en:'Network & Wi-Fi' },
      { he:'אימייל, ענן, כוננים משותפים', ru:'Почта, облако, общие диски', en:'Email, cloud, shared drives' },
      { he:'אבטחה וגיבויים', ru:'Безопасность и резервные копии', en:'Security & backup' },
    ],
    image: '/images/office.avif',
    video: '/videos/office.mp4',
  },
  {
    id: 'remote',
    tag: { he:'שירות שוטף קבוע', ru:'Регулярный', en:'Recurring' },
    h:   { he:'תמיכה מרחוק', ru:'Удалённая поддержка', en:'Remote Support' },
    p:   { he:'עזרה מהירה לכל בעיית IT, בלי להמתין לביקור', ru:'Быстрая помощь при любой IT-проблеме без ожидания визита', en:'Fast help for any tech issue — no waiting for a visit' },
    li:  [
      { he:'כל מערכת הפעלה, כל מכשיר', ru:'Любая ОС, любое устройство', en:'Any OS, any device' },
      { he:'וירוסים, האטות, קריסות', ru:'Вирусы, зависания, сбои', en:'Viruses, slowdowns, crashes' },
      { he:'זמין כתוכנית חודשית', ru:'Доступна как ежемесячный план', en:'Available as monthly plan' },
    ],
    image: '/images/remote.avif',
    video: '/videos/remote.mp4',
  },
  {
    id: 'studio',
    tag: { he:'סטודיו & קריאייטיב', ru:'Студия & Креатив', en:'Studio & Creative' },
    h:   { he:'שירותי IT לסטודיו', ru:'IT для студий', en:'IT for Studios' },
    p:   { he:'התקנה, שדרוג והגדרת תוכנות מקצועיות לסטודיו', ru:'Установка и настройка профессионального студийного ПО', en:'Installation and setup of professional studio software' },
    li:  [
      { he:'Cubase · Ableton · Logic Pro', ru:'Cubase · Ableton · Logic Pro', en:'Cubase · Ableton · Logic Pro' },
      { he:'Adobe Premiere · After Effects', ru:'Adobe Premiere · After Effects', en:'Adobe Premiere · After Effects' },
      { he:'Photoshop · Illustrator', ru:'Photoshop · Illustrator', en:'Photoshop · Illustrator' },
      { he:'אופטימיזציה של המחשב לביצועים מקסימליים', ru:'Оптимизация ПК для максимальной производительности', en:'PC optimization for maximum performance' },
    ],
    image: '/images/studio.avif',
    video: '/videos/studio.mp4',
  },
  {
    id: 'servers',
    color: 'acc2',
    tag: { he:'תשתיות', ru:'Инфраструктура', en:'Infrastructure' },
    h:   { he:'שרתים ורשתות', ru:'Серверы и сети', en:'Servers & Networks' },
    p:   { he:'תשתית רצינית לעסקים שצריכים אמינות, אבטחה ושליטה מלאה', ru:'Серьёзная инфраструктура для бизнеса', en:'Serious infrastructure for businesses that need reliability' },
    grid: [
      { he:['שרתי קבצים','אחסון מרכזי, גישה, גיבויים'], ru:['Файловые серверы','Хранение, права доступа, бэкапы'], en:['File Servers','Centralized storage, access control, backups'] },
      { he:['Active Directory','משתמשים, דומיין, מדיניות'], ru:['Active Directory','Пользователи, домен, политики'], en:['Active Directory','User management, domain, group policies'] },
      { he:['VPN ואבטחה','גישה מרחוק, חומת אש'], ru:['VPN и безопасность','Удалённый доступ, файрвол'], en:['VPN & Security','Secure remote access, firewall setup'] },
      { he:['ענן והיברידי','Microsoft 365, Azure, Google'], ru:['Облако и гибрид','Microsoft 365, Azure, Google'], en:['Cloud & Hybrid','Microsoft 365, Azure, Google Workspace'] },
      { he:['מצלמות אבטחה','מצלמות, NVR, צפייה מרחוק'], ru:['Видеонаблюдение','Камеры, NVR, удалённый просмотр'], en:['CCTV & Monitoring','Cameras, NVR, remote viewing'] },
      { he:['תשתית כבלים','תשתית קווית נקייה ואמינה'], ru:['Кабельная сеть','Чистая проводная инфраструктура'], en:['Structured Cabling','Clean, reliable wired infrastructure'] },
    ],
    image: '/images/servers.avif',
    video: '/videos/servers.mp4',
  },
  {
    id: 'partners',
    color: 'acc3',
    tag: { he:'שיתופי פעולה', ru:'Коллаборации', en:'Collaboration' },
    h:   { he:'שירותי שותפים', ru:'Партнёрские услуги', en:'Partner services' },
    p:   { he:'אני עובד עם מומחים מוכרים — איש קשר אחד, תוצאה מתואמת', ru:'Работаю с проверенными специалистами — один контакт', en:'I work with trusted specialists — one contact, coordinated result' },
    grid: [
      { he:['🌐 אתרים ודפי נחיתה','אתרים מודרניים רב-לשוניים'], ru:['🌐 Сайты и лендинги','Современные многоязычные сайты'], en:['🌐 Websites & Landing pages','Modern multilingual sites'] },
      { he:['📞 טלפוניית IP','מרכזייה וירטואלית, קווי SIP'], ru:['📞 IP-телефония','Виртуальные АТС, SIP-линии'], en:['📞 IP Telephony','Virtual PBX, SIP lines'] },
      { he:['🖨️ מדפסות ו-MFP','אספקה, הגדרה, תחזוקה'], ru:['🖨️ Принтеры и МФУ','Поставка, настройка, обслуживание'], en:['🖨️ Printers & MFP','Supply, setup and maintenance'] },
      { he:['🔒 בקרת כניסה','מנעולים חכמים, אינטרקום'], ru:['🔒 Контроль доступа','Замки, домофоны, пропуска'], en:['🔒 Access Control','Smart locks, intercoms, badge systems'] },
    ],
    image: '/images/partners.avif',
    video: '/videos/partners.mp4',
  },
];