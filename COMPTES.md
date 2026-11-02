# 🔐 Comptes Utilisateurs de Démonstration & Test — CJP

Ce document répertorie les comptes utilisateurs créés directement dans la base de données **Turso SQLite** pour le **Club des Jeunes Programmeurs (CJP)**.

Chaque compte correspond à l'un des 4 rôles et niveaux d'autorisation du système.

---

## 📋 Tableau Récapitulatif des Accès

| Rôle / Type | Nom & Prénom | Adresse Email | Mot de passe | URL d'accès |
|---|---|---|---|---|
| **Super-Administrateur** | Mamadou Diallo | `admin@cjp.org` | `Admin@2026!` | [http://localhost:3001/admin](http://localhost:3001/admin) |
| **Bureau Exécutif** | Fodé Momo Soumah | `bureau@cjp.org` | `Bureau@2026!` | [http://localhost:3001/bureau](http://localhost:3001/bureau) |
| **Chef de Classe** | Aïssatou Bah | `chef.classe@cjp.org` | `Chef@2026!` | [http://localhost:3001/classe](http://localhost:3001/classe) |
| **Membre Adhérent** | Ibrahima Camara | `membre@cjp.org` | `Membre@2026!` | [http://localhost:3001/profil](http://localhost:3001/profil) |

---

## 🛡️ Détails des Profils & Périmètres de Droits

### 1. Compte Super-Administrateur (`ADMIN`)
* **Email** : `admin@cjp.org`
* **Mot de passe** : `Admin@2026!`
* **Identité** : Mamadou Diallo
* **Téléphone** : `+224 620 00 00 01`
* **Rôle Club** : *Président & Super-Admin*
* **Licence & Programme** : L3 - Génie Logiciel (Promotion 2024-2027)
* **Périmètre & Droits** :
  * Accès complet à l'ensemble du système.
  * Création, modification et suppression des comptes utilisateurs.
  * Vue globale sur tous les adhérents, toutes classes et promotions confondues.
  * Redirection automatique vers `/admin`.

---

### 2. Compte Bureau Exécutif (`BUREAU`)
* **Email** : `bureau@cjp.org`
* **Mot de passe** : `Bureau@2026!`
* **Identité** : Fodé Momo Soumah
* **Téléphone** : `+224 621 11 22 33`
* **Rôle Club** : *Secrétaire Général*
* **Licence & Programme** : L3 - Génie Logiciel (Promotion 2024-2027)
* **Périmètre & Droits** :
  * Supervision globale des adhésions, cotisations et activités du club.
  * Suivi des nouvelles inscriptions et des réinscriptions.
  * Redirection automatique vers `/bureau`.

---

### 3. Compte Chef de Classe (`CHEF_DE_CLASSE`)
* **Email** : `chef.classe@cjp.org`
* **Mot de passe** : `Chef@2026!`
* **Identité** : Aïssatou Bah
* **Téléphone** : `+224 622 33 44 55`
* **Rôle Club** : *Chef de Promotion L2 GL*
* **Classe Affiliée** : **L2 - Génie Logiciel** (Promotion 2025-2028)
* **Périmètre & Droits** :
  * Ne fait **pas** partie de la liste des membres adhérents (compte de gestion pure).
  * Accès restreint uniquement à sa propre classe (**L2 - Génie Logiciel**) : impossibilité d'inscrire pour une autre promotion ou un autre département.
  * Ne voit **que** la liste des membres qu'il a lui-même inscrits ou réinscrits (`added_by`).
  * Tarifs officiels appliqués : **20 000 GNF** (Inscription) et **10 000 GNF** (Réinscription).
  * Tableau de bord financier automatique avec calcul du total collecté.
  * L'accès au bouton d'inscription et le statut du compte sont contrôlés par l'Admin.
  * Redirection automatique vers `/classe`.

---

### 4. Compte Membre Adhérent (`MEMBRE`)
* **Email** : `membre@cjp.org`
* **Mot de passe** : `Membre@2026!`
* **Identité** : Ibrahima Camara
* **Téléphone** : `+224 623 44 55 66`
* **Rôle Club** : *Membre Actif Développeur*
* **Licence & Programme** : L1 - Génie Logiciel (Promotion 2026-2029)
* **Périmètre & Droits** :
  * Consultation de son profil et de sa carte de membre virtuelle officielle CJP.
  * Redirection automatique vers `/profil`.

---

## 🚀 Comment Tester la Connexion

1. Rendez-vous sur la page d'authentification : **[http://localhost:3001/login](http://localhost:3001/login)**.
2. Saisissez l'email et le mot de passe du rôle que vous souhaitez tester.
3. Cliquez sur **Se connecter** : l'application vérifiera vos droits et vous redirigera directement vers l'espace correspondant.

> [!NOTE]
> Les mots de passe sont tous chiffrés avec l'algorithme `bcrypt` (10 rounds de salage) dans la table `user` de Turso.
