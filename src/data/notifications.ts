export type NotificationType = "review" | "comment" | "user" | "publish" | "system";

export type AppNotification = {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  read: boolean;
};

// Admins see the full picture: new users, published stories, reported
// comments, and moderation activity.
export const adminNotifications: AppNotification[] = [
  {
    id: "an1",
    type: "review",
    title: "३ समाचार समीक्षामा बाँकी",
    description: "मोडरेटरहरूले समीक्षा गर्न बाँकी रहेका समाचार तपाईंको ध्यान माग्छन्।",
    time: "12m ago",
    read: false,
  },
  {
    id: "an2",
    type: "comment",
    title: "टिप्पणी रिपोर्ट गरियो",
    description: "'नेप्से ५० अंकले बढ्यो' समाचारमा एउटा टिप्पणी आपत्तिजनक भनी रिपोर्ट भयो।",
    time: "40m ago",
    read: false,
  },
  {
    id: "an3",
    type: "publish",
    title: "समाचार प्रकाशित भयो",
    description: "लक्ष्मी शेर्पाले 'डिजिटल बैंकिङ प्रवर्द्धन' समाचार प्रकाशित गरिन्।",
    time: "2h ago",
    read: true,
  },
  {
    id: "an4",
    type: "user",
    title: "नयाँ मोडरेटर थपियो",
    description: "बिशाल तामाङ मोडरेटरको रूपमा टोलीमा थपिए।",
    time: "Yesterday",
    read: true,
  },
  {
    id: "an5",
    type: "system",
    title: "साप्ताहिक रिपोर्ट तयार छ",
    description: "यस हप्ताको ट्राफिक र engagement रिपोर्ट हेर्न Analytics मा जानुहोस्।",
    time: "2 days ago",
    read: true,
  },
];

// Moderators only care about what's sitting in their queue and their own
// recent decisions — not site-wide admin activity.
export const moderatorNotifications: AppNotification[] = [
  {
    id: "mn1",
    type: "review",
    title: "नयाँ समाचार समीक्षाको लागि",
    description: "'बजेट भाषण प्रत्यक्ष' समाचार समीक्षा पंक्तिमा थपियो।",
    time: "8m ago",
    read: false,
  },
  {
    id: "mn2",
    type: "comment",
    title: "टिप्पणी रिपोर्ट गरियो",
    description: "एउटा टिप्पणी समीक्षाको लागि फ्ल्याग गरियो।",
    time: "1h ago",
    read: false,
  },
  {
    id: "mn3",
    type: "publish",
    title: "तपाईंले प्रकाशित गर्नुभयो",
    description: "'NIFRA लाभांश' समाचार तपाईंले प्रकाशित गर्नुभएको थियो।",
    time: "Yesterday",
    read: true,
  },
];
