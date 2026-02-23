// rules_version = '2';
// service cloud.firestore {
//   match /databases/{database}/documents {
//     match /users/{userId} {
//       allow read, write: if request.auth != null && request.auth.uid == userId;
//       match /parcelles/{parcelleId} {
//         allow read, write: if request.auth != null && request.auth.uid == userId;
//         match /zones/{zoneId} {
//           allow read, write: if request.auth != null && request.auth.uid == userId;
//           match /recoltes/{recolteId} {
//             allow read, write: if request.auth != null && request.auth.uid == userId;
//           }
//         }
//       }
//     }
//     match /{document=**} {
//       allow read, write: if false;
//     }
//   }
// }
