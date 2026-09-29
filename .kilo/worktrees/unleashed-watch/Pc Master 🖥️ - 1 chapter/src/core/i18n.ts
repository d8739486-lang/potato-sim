import { useGameStore } from './store';

export const translations = {
  en: {
    menu: {
      title: "Workshop CLICKER",
      subtitle: "",
      start: "Start Adventure",
      watch_teaser: "Watch teaser again",
      teaser: "[ Watch teaser again ]",
      sound_hint: "If the sound does not work, restart the game!!!",
      chapter1: "CHAPTER 1",
      main_menu: "Main Menu",
      full_restart: "Full Restart",
      debug_title: "DD Control Panel",
      chapter_label: "Chapter {n}"
    },
    common: {
      cancel: "Cancel",
      save: "Save",
      close: "Close",
      ok: "OK",
      loading: "Loading...",
      error: "Error",
      success: "Success",
      confirm: "Confirm",
      back: "Back",
      now: "Now",
    },
    splash: {
      remake: "Remake?",
    },
    intro: {
      fullscreen_hint: "* Playing in full screen is recommended",
      skip: "SKIP"
    },
    chaos: {
      storage_error: "STORAGE ERROR",
      f2_hint: "Press F2 to enter BIOS",
      bsod_message: "Your PC ran into a problem and needs to restart. We're just collecting some error info, and then we'll restart for you.",
      stop_code: "Stop code: MASTER_CERTIFICATE_FAILURE"
    },
    prompt: {
      yes: "YES",
      no: "NO"
    },
    topBar: {
      balance: "Balance",
      perClick: "per click",
      auto: "auto",
      project: "PROJECT",
      evolution: "EVOLUTION",
      autoGen: "AUTO_GEN",
      sec: "sec",
      click: "click",
    },
    tabs: {
      terminal: "Terminal",
      hardware: "Hardware",
      shop: "Shop",
      promo: "PROMO",
      promoHint: "Enter promo code",
    },
    shop: {
      buy: "Buy",
      max: "MAX",
      level: "LVL",
      all: "BUY ALL",
      price: "Price",
    },
    promo: {
      title: "Promo Code",
      placeholder: "ENTER CODE...",
      submit: "ACTIVATE",
      invalid: "INVALID CODE",
      used: "CODE ALREADY USED",
      success: "PROMOCODE ACTIVATED",
      activated: "ACTIVATED",
      esc: "ESC TO CLOSE",
    },
    hardware: {
      installed: "Installed Components",
      stats: "System Performance",
      gpu: "Graphics",
      cpu: "Processor",
      drive: "Storage",
      passive: "Passive Income",
      clickPower: "Click Power",
      totalComponents: "Total Components",
      matrix: "Component Matrix",
      freq: "CPU FREQUENCY",
      temp: "TEMPERATURE",
      energy: "ENERGY",
      config: "Current Configuration",
    },
    settings: {
      title: "Settings",
      system: "System",
      personalization: "Personalization",
      update: "Update",
      security: "Security",
      about: "About",
      
      pcName: "PC NAME",
      rename: "Rename PC",
      renameHint: "(MAX 19 CHAR.)",
      
      updateStatus: "System is up to date",
      lastCheck: "Last check: Today",
      checkUpdates: "Check for updates",
      updateLog: "Update log: stable-v1.0.4, kernel-patch-22, ui-fix-88.",
      
      activation_title: "Windows Activation",
      activation_desc: "To activate Windows, go to Settings.",
      
      prologue: {
        continue: "CONTINUE",
        docs: "My Documents",
        errors: {
          default: "An unexpected error occurred during the operation.",
          recycle_bin: "Recycle Bin is corrupted by a virus. Cleaning is impossible through standard interface.",
          this_pc: "System Drive C: is locked. Access denied.",
          system_file: "File is corrupted or locked by another process.",
          taskbar: "Explorer (explorer.exe) is not responding. Error 0x80070005.",
          start_power: "Shutdown function is deactivated by the administrator.",
          settings_lock: "Access to this setting is restricted by a virus (KERNEL_LOCK).",
          bsod_lost: "Critical Error: BIOS is corrupted. Recovery is impossible.",
          sys_delete: "System Protection: File is protected by a process (TRUSTED_INSTALLER).",
          sys_scan_required: "System is still unsafe. Run a full scan in 'Updates & Security'."
        }
      },
      
      securityStatus: "System Protected",
      firewall: "Firewall: ACTIVE",
      encryption: "Encryption: AES-256",
      threats: "Threats: 0",
      
      storage_desc_fmt: "{used} used of {total}",
      ram_speed: "Speed: 5200 MT/s",
      rename_hint_btn: "Rename this PC (max 19)",
      device_specs: "Device specifications",
      device_id: "Device ID",
      product_id: "Product ID",
      system_type: "System type",
      system_type_value: "64-bit OS, x64-based processor",
      pen_touch: "Pen and touch",
      pen_touch_value: "No pen or touch input is available for this display",
      updateLog_title: "Update log",
      security_title: "Windows Security",
      security_status_ok: "Service is running normally",
      security_items: {
        virus: "Virus & threat protection",
        firewall: "Firewall & network protection",
        browser: "App & browser control",
        device: "Device security"
      },
      security_statuses: {
        no_threats: "No threats found",
        network_protected: "Network protected",
        active: "Active",
        protection_desc: "Threat protection is up to date.",
        last_scan: "Last scan: {time}",
        quick_scan_fmt: "Quick scan {time}",
        scan_results: "0 threats found.",
        status_ok: "OK"
      },
      current_build: "Current Build",
      version_title: "PC Master Pro Edition",
      update_kb: "KB5041585: Cumulative Update (PC Master OS 4.2.1)",
      update_av: "Antivirus definitions: v1.411.758.0",
      update_gpu: "Graphics Driver: Pro-Sync 2026.1",
      user_info: {
        admin: "Administrator",
        local: "Local account"
      },
      tabs: {
        system: "System",
        update: "Update",
        security: "Security"
      },
      memory_unit: "GB"
    },
    terminal: {
      initialMsg: "PC Master OS [Version 1.0.4]\n(c) 2026 Master Corp. All rights reserved.",
      help: "Available commands:\n- help: Show this message\n- clear: Clear terminal\n- system: Show system info\n- exit: Close current session",
      systemInfo: "SYSTEM INFO:\nOS: PC Master v1.0.4\nCPU: {cpu}\nGPU: {gpu}\nRAM: 16GB Virtual",
    },
    notifications: {
      newHardware: "New hardware detected!",
      updateAvailable: "System update available.",
    },
    invitation: {
      title: "SECURE ENCRYPTED INVITATION",
      context: "CONTEXT: HANDSHAKE_INITIATED",
      msg: "YOU HAVE BEEN CHOSEN TO WITNESS THE SINGULARITY. THE SYSTEM IS READY. THE CORE IS WAITING.",
      warning: "WARNING: DO NOT DISCLOSE THE CONTENTS OF THIS MESSAGE.",
      accept: "INITIALIZE Handshake",
    },
    upgrade: {
      title: "System Components",
      buyAll: "Buy All",
      status: "STATUS",
      protection: "PROTECTION",
      ready: "READY FOR EVOLUTION",
      waiting: "WAITING FOR UPDATE",
    },
    clicker: {
      title: "TAP FOR MONEY!",
      evolve: "GO TO NEXT LEVEL",
      maxed: "SYSTEM MAXIMALLY UPGRADED",
      certificate: "GET MASTER CERTIFICATE",
      waiting: "[ SYSTEM WAITING FOR UPGRADES ]",
    },
    desktop: {
      pc: "This PC",
      browser: "Browser",
      docs: "Documents",
      mail: "Mail",
      trash: "Trash",
      settings: "Settings",
      start: {
        user: "User",
        local_account: "Local Account",
        pinned: "Pinned",
        power: "Power",
        settings: "Settings"
      },
      shutdown: {
        title: "Select action",
        desc: "All unsaved data will be lost.",
        off: "Shut down",
        reboot: "Restart"
      }
    },
    fs: {
      quick_access: "Quick Access",
      empty: "Folder is empty",
      gb: "GB",
      gb_free: "GB FREE",
      items: "items",
      docs: "Documents",
      downloads: "Downloads",
      today: "Today",
      yesterday: "Yesterday",
      days_ago: "days ago",
      log_date_fmt: "{date}, {time}",
      local_disk: "Local Disk ({drive})",
      notes: {
        name: "notes.txt",
        content: "Notes:\n\n1. Check system after virus\n2. Update drivers\n3. Don't open suspicious files\n4. Backup important data\n\nP.S. If BSOD again - try F2 for BIOS."
      },
      error: {
        not_found_title: "File not found",
        not_found_desc: "Windows cannot find \"{name}\".",
        not_found_hint: "Make sure the name is typed correctly and try again.",
        code: "Error code: 0x80070002 FILE_NOT_FOUND",
        cannot_open: "Cannot open {name}",
        access_denied_desc: "Access denied. {name} is corrupted due to a virus attack. Recovery is impossible.",
        access_denied_code: "Error code: 0xE0040012 ACCESS_DENIED"
      },
      storage_error: {
        title: "Storage Device Error",
        msg: "Windows has detected a problem with a storage device.",
        desc: "An error occurred while accessing the disk. Some data may be lost or unavailable.\n\nPlease ensure that the device is properly connected and try again. If the problem persists, you may need to restart your computer or replace the storage device.",
        code: "Error Code: 0x0009809X"
      },
      deleted_object: "Deleted object",
      log: {
        name: "system_log.txt",
        content: "[12:00:00] SYSTEM BOOT — OK\n[12:00:01] Loading drivers... OK\n[12:00:02] Network adapter: DISCONNECTED\n[12:00:03] Firewall: ACTIVE\n[12:00:04] Antivirus scan: STARTED"
      },
      readme: {
        name: "readme.txt",
        content: "=== PC MASTER OS ===\n\nVersion: 4.2.1 (Rebuild)\nStatus: Recovered after virus attack\n\nAll system files have been scanned and restored.\nAntivirus databases updated.\n\nWARNING: Some functions may be limited\nuntil full diagnostic completion.\n\nTechnical Support: support@pcmaster.os\n(server temporarily unavailable)"
      }
    },
    mail: {
      inbox: "Inbox",
      sent: "Sent",
      select: "Select a message to view",
      contract_subj: "Contract for cooperation",
      contract_preview: "Please review the contract...",
      msg1: {
        from: "System Security",
        subj: "System Restored",
        body: "Your system has been successfully restored after the recent virus attack. Security protocols are active. Please check your documents for the recovery report."
      },
      msg2: {
        from: "Tech Support",
        subj: "Driver Update",
        body: "New drivers for your hardware are available. System stability has been improved by 14%."
      },
      msg3: {
        subj: "Invitation: Handshake",
        body: "Handshake initiated. Data stream encrypted. Awaiting further interaction."
      },
      invite: {
        secure_tag: "SECURE ENCRYPTED INVITATION",
        body1: "We have watched every line of your code, every decision in the face of chaos. Your ",
        body1_bold: "potential",
        body1_end: " exceeds any standards.",
        body2: "Small games are over. This is an invitation to the ",
        body2_bold: "vanguard of digital evolution",
        body2_end: ". We are opening access to horizons that for others are just noise.",
        body3: "This is your ",
        body3_red: "only chance",
        body3_end: " to step outside the system.",
        hint: "If you are ready to accept the challenge — visit our official website. ",
        hint_bold: "There is no other way.",
        visit_site: "Visit site"
      },
      st_invite: {
        from: "SentinelTech (ST)",
        subj: "Invitation to cooperate",
        body: "Greetings, {user}. We work in partnership with DD and saw your contract confirmation. You can start working right now on our internal portal.",
        btn: "Access Portal"
      },
      st_initiation: {
        from: "SentinelTech (ST)",
        subj: "Order: Initialization",
        body: "To continue working on the portal, enter your personal authorization code:\n\nCODE: DD-9921-WORKER"
      },
      contract: {
        title: "Contract №8832",
        body: "I, the undersigned, confirm my consent to data processing and participation in Digital Dreams operations.",
        placeholder: "Enter your name",
        btn: "accept",
        footer: "THANK YOU FOR CHOOSING DIGITAL DREAMS. YOUR TALENT IS OUR PRIORITY.\nALL DATA IS ENCRYPTED VIA RSA-4096 PROTOCOL."
      },
      new_msg: "You have a new message",
      new_msg_simple: "new message",
      system_msg: "System Message",
      unknown_sender: "Unknown Sender",
    },
    browser: {
      address_placeholder: "Enter URL...",
      search_placeholder: "Search the web...",
      new_tab: "New Tab",
      url_placeholder: "Enter URL",
      connecting: "Connecting to secure server...",
      images: "Images",
      google_search: "Google Search",
      lucky_search_btn: "I'm Feeling Lucky",
      lucky_search: "The most popular video hosting in the world.",
      search_results_for: "Search results for: ",
      youtube: {
        views_fmt: "{n} views"
      }
    },
    dd: {
      tactical_desc: "A safe place for professional hackers.",
      hero_tagline: "Hacking Services & Security Solutions",
      tactical_title: "Tactical Control",
      tactical_desc1: "We provide unreachable solutions in cybersecurity and offensive operations. No limits, no boundaries.",
      tactical_desc2: "Our mission is to connect the best specialists: from reverse engineers to social engineering masters. Over 2,847 successful contracts worldwide confirm our effectiveness.",
      feature1: "Global Coverage",
      feature2: "Zero-Day Exploits",
      security_title: "Absolute Protection",
      security_desc: "In a world where data is more valuable than oil, we are the impassable wall between your assets and the network's chaos.",
      security_quote: "\"Every firewall is just a door. Only a system that anticipates the strike before it's delivered is truly protected.\"",
      feature3: "OSINT & Audit",
      feature4: "Asset Protection",
      cta_title: "Are you ready?",
      cta_desc: "We don't just offer a job — we offer a place among those who define the future. The decision is made only once.",
      cta_warning: "THIS IS YOUR ONLY CHANCE.",
    },
    st: {
      diagnosis_title: "Deep System Diagnosis",
      scanning_sectors: "Scanning sectors",
      abort_btn: "Abort (OMEGA level required)",
      gateway_active: "SECRET GATEWAY ACTIVE",
      auth_title: "Employee Authorization",
      auth_desc: "Welcome to SentinelTech closed network. Access is only allowed for authorized agents. Any attempt of unauthorized access is tracked and punished by law.",
      access_code_label: "Personal Access Code",
      access_code_placeholder: "DD-XXXX-WORKER",
      connect_btn: "Establish Connection",
      encryption_tag: "Connection secured by quantum encryption",
      summary_title: "Operational Summary",
      search_placeholder: "Search",
      portal_title: "INTERNAL",
      network_status: "Network Status",
      stats: {
        security_level: "Security Level",
        security_level_value: "OMEGA-9",
        network_node: "Network Node",
        network_node_value: "NODE-772",
        uplink_power: "Uplink Power",
        uplink_power_value: "8.4 TW",
      },
      cards: {
        contract_title: "Contract",
        contract_desc: "Working rules, non-disclosure agreement, and partnership terms.",
        tasks_title: "Tasks",
        tasks_desc: "List of current operational tasks to be performed in the system.",
        diagnosis_title: "Start Diagnosis",
        diagnosis_desc: "Critical check of all file systems. Takes a considerable amount of time.",
      },
      diag: {
        internal_title: "System Diagnosis",
        internal_desc: "Scanning local disks for bad sectors",
        checking: "Checking...",
        scanning_label: "SCANNING",
        searching_vulnerabilities: "Searching for critical vulnerabilities...",
      },
      nda: {
        title: "Non-Disclosure Agreement (NDA)",
        body: "1. GENERAL PROVISIONS\nAny information obtained during work on the SentinelTech internal portal is strictly confidential and classified as \"TOP SECRET\".\n\n2. EMPLOYEE OBLIGATIONS\nThe employee agrees not to disclose information about the methods, algorithms, and software used by the company to third parties. Taking photos, copying, and exporting data outside the isolated environment is strictly prohibited.\n\n3. INTEGRATION WITH DIGITAL DREAMS\nThe project is implemented jointly with DD Corporation. All detected anomalies must be processed according to the unified security protocol.\n\n4. RESPONSIBILITY\nViolation of this agreement entails immediate blocking of access, cancellation of the contract, and transfer of the case to internal security for further action (\"Erasure\" protocol).",
      },
      tasks: {
        title: "Current Tasks",
        new_badge: "1 NEW",
        op1_title: "Operation: First Step",
        op1_desc: "Your goal is to prepare the system for further manipulations. Follow the list strictly.",
        task1_title: "Run file check",
        task1_desc: "Use the diagnosis utility on the main dashboard of the portal.",
        task2_title: "Check disk 'C:'",
        task2_desc: "Explore the file system structure.",
      }
    },
    bios: {
      titles: {
        main: "Phoenix - AwardBIOS CMOS Setup Utility"
      },
      unstable_kernel: "! UNSTABLE KERNEL !",
      cmd_title: "Command Prompt",
      ps_title: "Administrator: Windows PowerShell",
      available_cmds: "Available commands:",
      help_hint: "Type \"help\" to see available commands.",
      dev_mode_activated: "Dev mode activated. Open PowerShell.",
      not_recognized: "'{cmd}' is not recognized.",
      connect_host: "- connect host : Bridge connection to host",
      host_discovered: "HOST DISCOVERED. PowerShell interface linked. Open PowerShell to continue.",
      connect_host_hint: "Try 'connect host' to bridge connection.",
      decrypt_core: "- decrypt core : Decrypt system kernel",
      core_decrypted: "CORE DECRYPTED. Access PowerShell for final handshake.",
      identity_failed: "Identity verification failed.",
      handshake_req: "FINAL_HANDSHAKE_REQUIRED.",
      core_encrypted: "The core is encrypted. What is the key?",
      hint_ny: "(Hint: N is for failure, Y is for victory)",
      verify_host: "Is this you trying to connect the host ({host})? Y/N",
      establishing_conn: "[ESTABLISHING SECURE CONNECTION...]",
      access_granted: "ACCESS GRANTED",
      type_run: "Type /f run to proceed.",
      cant_run: "YOU CAN'T RUN!",
      invalid_input: "Invalid input. Y/N.",
      access_denied_run: "Error: ACCESS_DENIED. Command must be /f run.",
      incorrect_key: "INCORRECT KEY.",
      try_again_fail: "Try again or choose N to fail.",
      init_verification: "> Initializing file verification...",
      calc_checksums: "> Calculating checksums...",
      verification_fail: "Verification complete. System integrity check: FAIL.",
      await_override: "Awaiting administrative override (e.g., reboot core)...",
      access_kernel: "> Accessing kernel sectors...",
      rewrite_boot: "> Rewriting boot parameters...",
      reboot_init: "REBOOT_SEQUENCE_INITIALIZED: OK",
      rebooting: "rebooting...",
      ps_processing: "Processing kernel request...",
      loading: "LOADING BIOS INTERFACE...",
      tabs: {
        main: "Main",
        advanced: "Advanced",
        security: "Security",
        boot: "Boot",
        admin: "Administrative",
        exit: "Exit"
      },
      admin_title: "System Administration",
      admin: {
        system_core: "System Core",
        cmd: "CMD Prompt",
        powershell: "PowerShell",
        network: "Network Stack",
        registry: "Registry Editor"
      },
      status: {
        encrypted: "[ ENCRYPTED ]",
        locked: "[ LOCKED ]",
        live: "[ АКТИВНО ]"
      },
      empty: "EMPTY...",
      stats: {
        title: "System Status",
        cpu_temp: "CPU Temp:",
        fan_speed: "Fan Speed:",
        voltage: "Voltage:",
        integrity: "Integrity:",
        critical: "CRITICAL",
        ok: "OK"
      }
    },
    defender: {
      file_moved: "file moved to trash",
      bin_emptied: "trash emptied",
      bin_empty: "trash is empty, nothing to clear",
      title: "WINDOWS DEFENDER",
      status_critical: "CRITICAL_INFECTION",
      attention: "Attention Required",
      attention_desc: "Malicious patterns detected in memory. Deep scan recommended immediately.",
      start_scan: "Start Deep Scan",
      analyzing: "Analyzing sectors...",
      completed: "Completed",
      severity: "Severity: HIGH",
      quarantine: "Quarantine",
      delete: "Delete",
      ignore: "Ignore",
      threats_found: "Threats Detected",
      threats_removed: "All identified threats have been successfully removed.",
    },
    ending: {
      konets: "THE END",
      thanks: "THANKS FOR PLAYING PART 1",
      last: "NOW JUST RELAX AND LISTEN TO THE MUSIC",
      bsod_stop_code: "Stop Code:",
      bsod_what_failed: "What failed:",
      bsod_additional_info: "Additional Information:",
      bsod_fault_desc: "A severe fault has occurred within the system board.",
      bsod_init_failed: "Hardware initialization failed. System integrity cannot be guaranteed.",
      full_history: "FULL HISTORY COMPLETED",
      congrats: "Congratulations! You have completed all available content for PC MASTER OS. You have successfully handled all threats and uncovered Digital Dreams' plans.",
      restart: "RESTART"
    }
  },
  ru: {
    menu: {
      title: "Мастерская КЛИКЕР",
      subtitle: "",
      start: "Начать приключение",
      watch_teaser: "Посмотреть тизер заново",
      teaser: "[ Посмотреть тизер заново ]",
      sound_hint: "если не работает звук перезапустите игру!!!",
      chapter1: "ГЛАВА 1",
      main_menu: "Главное Меню",
      full_restart: "Полный Рестарт",
      debug_title: "Панель Управления DD",
      chapter_label: "Глава {n}"
    },
    common: {
      cancel: "Отмена",
      save: "Сохранить",
      close: "Закрыть",
      ok: "ОК",
      loading: "Загрузка...",
      error: "Ошибка",
      success: "Успех",
      confirm: "Подтвердить",
      back: "Назад",
      now: "Сейчас",
    },
    splash: {
      remake: "Ремейк?",
    },
    intro: {
      fullscreen_hint: "* Желательно играть во весь экран",
      skip: "ПРОПУСТИТЬ"
    },
    chaos: {
      storage_error: "ОШИБКА НАКОПИТЕЛЯ",
      f2_hint: "Нажмите F2 для входа в BIOS",
      bsod_message: "На вашем ПК возникла проблема, и его необходимо перезагрузить. Мы лишь собираем некоторую информацию об ошибке, а затем выполним перезагрузку.",
      stop_code: "Код остановки: MASTER_CERTIFICATE_FAILURE"
    },
    prompt: {
      yes: "ДА",
      no: "НЕТ"
    },
    topBar: {
      balance: "Баланс",
      perClick: "за клик",
      auto: "авто",
      project: "ПРОЕКТ",
      evolution: "ЭВОЛЮЦИЯ",
      autoGen: "АВТО_ГЕН",
      sec: "сек",
      click: "клик",
    },
    tabs: {
      terminal: "Терминал",
      hardware: "Железо",
      shop: "Магазин",
      promo: "ПРОМО",
      promoHint: "Ввести промокод",
    },
    shop: {
      buy: "Купить",
      max: "МАКС",
      level: "УР",
      all: "КУПИТЬ ВСЕ",
      price: "Цена",
    },
    promo: {
      title: "Промокод",
      placeholder: "ВВЕДИТЕ КОД...",
      submit: "АКТИВИРОВАТЬ",
      invalid: "НЕВЕРНЫЙ КОД",
      used: "КОД УЖЕ ИСПОЛЬЗОВАН",
      success: "ПРОМОКОД АКТИВИРОВАН",
      activated: "АКТИВИРОВАНО",
      esc: "ESC ДЛЯ ЗАКРЫТИЯ",
    },
    hardware: {
      installed: "Установленные компоненты",
      stats: "Производительность системы",
      gpu: "Графика",
      cpu: "Процессор",
      drive: "Накопитель",
      passive: "Пассивная прибыль",
      clickPower: "Сила клика",
      totalComponents: "Всего компонентов",
      matrix: "Матрица Компонентов",
      freq: "ЧАСТОТА ЦПУ",
      temp: "ТЕМПЕРАТУРА",
      energy: "ЭНЕРГИЯ",
      config: "Текущая конфигурация",
    },
    settings: {
      title: "Параметры",
      system: "Система",
      personalization: "Персонализация",
      update: "Обновление",
      security: "Безопасность",
      about: "О системе",
      
      pcName: "ИМЯ ПК",
      rename: "Переименовать ПК",
      renameHint: "(МАКС 19 СИМВ.)",
      
      updateStatus: "Система обновлена",
      lastCheck: "Последняя проверка: Сегодня",
      checkUpdates: "Проверить обновления",
      updateLog: "Журнал: stable-v1.0.4, kernel-patch-22, ui-fix-88.",
      
      activation_title: "Активация Windows",
      activation_desc: "Чтобы активировать Windows, перейдите в раздел \"Параметры\".",
      
      prologue: {
        continue: "ПРОДОЛЖИТЬ",
        docs: "Мои документы",
        errors: {
          default: "Произошла неожиданная ошибка при выполнении операции.",
          recycle_bin: "Корзина повреждена вирусом. Очистка невозможна через стандартный интерфейс.",
          this_pc: "Системный диск C: заблокирован. Отказано в доступе.",
          system_file: "Файл поврежден или заблокирован другим процессом.",
          taskbar: "Проводник (explorer.exe) не отвечает. Ошибка 0x80070005.",
          start_power: "Функция выключения деактивирована администратором.",
          settings_lock: "Доступ к этому параметру ограничен вирусом (KERNEL_LOCK).",
          bsod_lost: "Критическая ошибка: BIOS поврежден. Восстановление невозможно.",
          sys_delete: "Системная защита: Файл защищен процессом (TRUSTED_INSTALLER).",
          sys_scan_required: "Система всё еще небезопасна. Запустите полное сканирование в разделе 'Обновления и безопасность'."
        }
      },
      
      securityStatus: "Система защищена",
      firewall: "Брандмауэр: АКТИВЕН",
      encryption: "Шифрование: AES-256",
      threats: "Угрозы: 0",

      storage_desc_fmt: "Использовано {used} из {total}",
      ram_speed: "Скорость: 5200 MT/s",
      rename_hint_btn: "Переименовать этот компьютер (максимум 19)",
      device_specs: "Характеристики устройства",
      device_id: "Код устройства",
      product_id: "Код продукта",
      system_type: "Тип системы",
      system_type_value: "64-разрядная ОС, процессор x64",
      pen_touch: "Перо и сенсорный ввод",
      pen_touch_value: "Для этого монитора недоступен ввод с помощью пера и сенсорный ввод",
      updateLog_title: "Журнал обновлений",
      security_title: "Безопасность Windows",
      security_status_ok: "Служба работает в штатном режиме",
      security_items: {
        virus: "Защита от вирусов",
        firewall: "Брандмауэр",
        browser: "Защита браузера",
        device: "Безопасность устройства"
      },
      security_statuses: {
        no_threats: "Угроз не обнаружено",
        network_protected: "Сеть защищена",
        active: "Активна",
        protection_desc: "Защита от угроз актуальна.",
        last_scan: "Последнее сканирование: {time}",
        quick_scan_fmt: "Быстрое сканирование {time}",
        scan_results: "Угроз не обнаружено.",
        status_ok: "ОК"
      },
      current_build: "Текущая сборка",
      version_title: "PC Master Pro Edition",
      update_kb: "KB5041585: Накопительное обновление (PC Master OS 4.2.1)",
      update_av: "Определения для антивируса: v1.411.758.0",
      update_gpu: "Драйвер графики: Pro-Sync 2026.1",
      user_info: {
        admin: "Администратор",
        local: "Локальная учётная запись"
      },
      tabs: {
        system: "Система",
        update: "Обновление",
        security: "Безопасность"
      },
      memory_unit: "ГБ"
    },
    terminal: {
      initialMsg: "PC Master OS [Версия 1.0.4]\n(c) 2026 Master Corp. Все права защищены.",
      help: "Доступные команды:\n- help: Показать это сообщение\n- clear: Очистить терминал\n- system: Инфо о системе\n- exit: Закрыть сессию",
      systemInfo: "ИНФО О СИСТЕМЕ:\nОС: PC Master v1.0.4\nЦПУ: {cpu}\nГПУ: {gpu}\nОЗУ: 16ГБ Вирт.",
    },
    notifications: {
      newHardware: "Обнаружено новое железо!",
      updateAvailable: "Доступно обновление системы.",
    },
    invitation: {
      title: "ЗАШИФРОВАННОЕ ПРИГЛАШЕНИЕ",
      context: "КОНТЕКСТ: РУКОПОЖАТИЕ_ИНИЦИИРОВАНО",
      msg: "ВЫ БЫЛИ ВЫБРАНЫ, ЧТОБЫ СТАТЬ СВИДЕТЕЛЕМ СИНГУЛЯРНОСТИ. СИСТЕМА ГОТОВА. ЯДРО ЖДЕТ.",
      warning: "ВНИМАНИЕ: НЕ РАЗГЛАШАЙТЕ СОДЕРЖИМОЕ ЭТОГО СООБЩЕНИЯ.",
      accept: "ИНИЦИИРОВАТЬ Рукопожатие",
    },
    upgrade: {
      title: "Компоненты Системы",
      buyAll: "Купить Всё",
      status: "СТАТУС",
      protection: "ЗАЩИТА",
      ready: "ГОТОВ К ЭВОЛЮЦИИ",
      waiting: "ОЖИДАНИЕ ОБНОВЛЕНИЯ",
    },
    clicker: {
      title: "ТАПАЙ РАДИ ДЕНЕГ!",
      evolve: "ПЕРЕЙТИ НА СЛЕДУЮЩИЙ УРОВЕНЬ",
      maxed: "СИСТЕМА МАКСИМАЛЬНО МОДЕРНИЗИРОВАНА",
      certificate: "ПОЛУЧИТЬ СЕРТИФИКАТ МАСТЕРА",
      waiting: "[ СИСТЕМА ОЖИДАЕТ МОДЕРНИЗАЦИИ ]",
    },
    desktop: {
      pc: "Этот компьютер",
      browser: "Браузер",
      docs: "Документы",
      mail: "Почта",
      trash: "Корзина",
      settings: "Параметры",
      start: {
        user: "Пользователь",
        local_account: "Локальная учётная запись",
        pinned: "Закреплённые",
        power: "Питание",
        settings: "Настройки"
      },
      shutdown: {
        title: "Выберите действие",
        desc: "Все несохранённые данные будут потеряны.",
        off: "Выключить",
        reboot: "Перезагрузить"
      }
    },
    fs: {
      quick_access: "Быстрый доступ",
      empty: "Папка пуста",
      gb: "ГБ",
      gb_free: "ГБ СВОБОДНО",
      items: "элементов",
      docs: "Документы",
      downloads: "Загрузки",
      today: "Сегодня",
      yesterday: "Вчера",
      days_ago: "дня(ей) назад",
      log_date_fmt: "{date}, {time}",
      local_disk: "Локальный диск ({drive})",
      notes: {
        name: "заметки.txt",
        content: "Заметки:\n\n1. Проверить систему после вируса\n2. Обновить драйвера\n3. Не открывать подозрительные файлы\n4. Сделать бэкап важных данных\n\nP.S. Если снова будет синий экран — попробовать F2 для BIOS."
      },
      error: {
        not_found_title: "Не удалось найти файл",
        not_found_desc: "Windows не удаётся найти «{name}».",
        not_found_hint: "Убедитесь, что имя введено правильно, и повторите попытку.",
        code: "Код ошибки: 0x80070002 FILE_NOT_FOUND",
        cannot_open: "Невозможно открыть {name}",
        access_denied_desc: "Доступ к объекту запрещён. {name} поврежден в результате вирусной атаки. Восстановление невозможно.",
        access_denied_code: "Код ошибки: 0xE0040012 ACCESS_DENIED"
      },
      storage_error: {
        title: "Ошибка накопителя",
        msg: "Windows обнаружила проблему с накопителем.",
        desc: "При обращении к диску произошла ошибка. Некоторые данные могут быть потеряны или недоступны.\n\nУбедитесь, что устройство подключено правильно, и повторите попытку. Если проблема не устранена, возможно, потребуется перезагрузить компьютер или заменить накопитель.",
        code: "Код ошибки: 0x0009809X"
      },
      deleted_object: "Удаленный объект",
      log: {
        name: "system_log.txt",
        content: "[12:00:00] SYSTEM BOOT — OK\n[12:00:01] Loading drivers... OK\n[12:00:02] Network adapter: DISCONNECTED\n[12:00:03] Firewall: ACTIVE\n[12:00:04] Antivirus scan: STARTED"
      },
      readme: {
        name: "readme.txt",
        content: "=== PC MASTER OS ===\n\nВерсия: 4.2.1 (Rebuild)\nСтатус: Восстановлена после вирусной атаки\n\nВсе системные файлы были проверены и восстановлены.\nАнтивирусные базы обновлены.\n\nВНИМАНИЕ: Некоторые функции могут быть ограничены\nдо полного завершения диагностики.\n\nТехническая поддержка: support@pcmaster.os\n(сервер временно недоступен)"
      }
    },
    mail: {
      inbox: "Входящие",
      sent: "Отправленные",
      select: "Выберите сообщение для просмотра",
      contract_subj: "Контракт на сотрудничество",
      contract_preview: "Пожалуйста, ознакомьтесь с контрактом...",
      msg1: {
        from: "Security System",
        subj: "Система восстановлена",
        body: "Ваша система была успешно восстановлена после недавней вирусной атаки. Протоколы безопасности активны. Пожалуйста, проверьте документы на наличие отчета о восстановлении."
      },
      msg2: {
        from: "Tech Support",
        subj: "Обновление драйверов",
        body: "Доступны новые драйверы для вашего оборудования. Стабильность системы повышена на 14%."
      },
      msg3: {
        subj: "Приглашение: Handshake",
        body: "Рукопожатие инициировано. Поток данных зашифрован. Ожидание дальнейшего взаимодействия."
      },
      invite: {
        secure_tag: "ЗАШИФРОВАННОЕ ПРИГЛАШЕНИЕ",
        body1: "Мы наблюдали за каждой вашей строчкой кода, за каждым решением в условиях хаоса. Ваш ",
        body1_bold: "потенциал",
        body1_end: " превосходит любые стандарты.",
        body2: "Мелкие игры окончены. Это приглашение в ",
        body2_bold: "авангард цифровой эволюции",
        body2_end: ". Мы открываем вам доступ к горизонтам, которые для остальных — лишь шум.",
        body3: "Это ваш ",
        body3_red: "единственный шанс",
        body3_end: " выйти за пределы системы.",
        hint: "Если вы готовы принять вызов — переходите на наш официальный сайт. ",
        hint_bold: "Другого пути не будет.",
        visit_site: "Посетить сайт"
      },
      st_invite: {
        from: "SentinelTech (ST)",
        subj: "Приглашение к сотрудничеству",
        body: "Приветствуем, {user}. Мы работаем в партнерстве с DD и видели ваше подтверждение контракта. Вы можете приступить к работе прямо сейчас на нашем внутреннем портале.",
        btn: "Доступ к Порталу"
      },
      st_initiation: {
        from: "SentinelTech (ST)",
        subj: "Распоряжение: Инициализация",
        body: "Для продолжения работы на портале, введите ваш персональный код авторизации:\n\nКОД: DD-9921-WORKER"
      },
      contract: {
        title: "Контракт №8832",
        body: "Я, нижеподписавшийся, подтверждаю своё согласие на обработку данных и участие в операциях Digital Dreams.",
        placeholder: "Введите ваше имя",
        btn: "принять",
        footer: "БЛАГОДАРИМ ЗА ВЫБОР DIGITAL DREAMS. ВАШ ТАЛАНТ — НАШ ПРИОРИТЕТ.\nВСЕ ДАННЫЕ ЗАШИФРОВАНЫ ПО ПРОТОКОЛУ RSA-4096."
      },
      new_msg: "У вас новое сообщение",
      new_msg_simple: "новое сообщение",
      system_msg: "Системное сообщение",
      unknown_sender: "Неизвестный отправитель",
    },
    browser: {
      address_placeholder: "Введите URL...",
      search_placeholder: "Поиск в сети...",
      new_tab: "Новая вкладка",
      url_placeholder: "Введите URL",
      connecting: "Установка защищенного соединения...",
      images: "Картинки",
      google_search: "Поиск в Google",
      lucky_search_btn: "Мне повезёт",
      lucky_search: "Самый популярный видеохостинг в мире.",
      search_results_for: "Результаты поиска по запросу: ",
      youtube: {
        views_fmt: "{n} просмотров"
      }
    },
    dd: {
      tactical_desc: "Безопасное место для профессиональных хакеров.",
      hero_tagline: "Услуги взлома и решения в области безопасности",
      tactical_title: "Тактический Контроль",
      tactical_desc1: "Мы предоставляем недосягаемые решения в области кибербезопасности и наступательных операций. Никаких лимитов, никаких границ.",
      tactical_desc2: "Наша миссия — объединить лучших специалистов: от инженеров обратной разработки до мастеров социальной инженерии. Более 2847 успешных контрактов по всему миру подтверждают нашу эффективность.",
      feature1: "Глобальное Покрытие",
      feature2: "Zero-Day Эксплуаты",
      security_title: "Абсолютная Защита",
      security_desc: "В мире, где данные ценнее нефти, мы — непроходимая стена между вашими активами и хаосом сети.",
      security_quote: "\"Каждый брандмауэр — это просто дверь. По-настоящему защищена только та система, которая предвидит удар до его нанесения.\"",
      feature3: "OSINT и Аудит",
      feature4: "Защита Активов",
      cta_title: "Вы готовы?",
      cta_desc: "Мы не просто предлагаем работу — мы предлагаем место среди тех, кто определяет будущее. Решение принимается лишь однажды.",
      cta_warning: "ЭТО ВАШ ЕДИНСТВЕННЫЙ ШАНС.",
    },
    st: {
      diagnosis_title: "Глубокая диагностика системы",
      scanning_sectors: "Сканирование секторов",
      abort_btn: "Прервать (Требуется уровень доступа OMEGA)",
      gateway_active: "СЕКРЕТНЫЙ ШЛЮЗ АКТИВЕН",
      auth_title: "Авторизация Сотрудника",
      auth_desc: "Добро пожаловать в закрытую сеть SentinelTech. Доступ разрешён только авторизованным агентам. Любая попытка несанкционированного доступа отслеживается и карается по закону.",
      access_code_label: "Персональный код доступа",
      access_code_placeholder: "DD-XXXX-WORKER",
      connect_btn: "Установить Соединение",
      encryption_tag: "Соединение защищено квантовым шифрованием",
      summary_title: "Оперативная Сводка",
      search_placeholder: "Поиск",
      portal_title: "INTERNAL",
      network_status: "Статус Сети",
      stats: {
        security_level: "Уровень безопасности",
        security_level_value: "OMEGA-9",
        network_node: "Сетевой узел",
        network_node_value: "NODE-772",
        uplink_power: "Мощность канала",
        uplink_power_value: "8.4 TW",
      },
      cards: {
        contract_title: "Контракт",
        contract_desc: "Правила работы, соглашение о неразглашении и условия сотрудничества.",
        tasks_title: "Задания",
        tasks_desc: "Список текущих оперативных задач для выполнения в системе.",
        diagnosis_title: "Начать диагностику",
        diagnosis_desc: "Критическая проверка всех файловых систем. Занимает продолжительное время.",
      },
      diag: {
        internal_title: "Диагностика Системы",
        internal_desc: "Сканирование локальных дисков на наличие поврежденных секторов",
        checking: "Проверка...",
        scanning_label: "СКАНИРОВАНИЕ",
        searching_vulnerabilities: "Поиск критических уязвимостей...",
      },
      nda: {
        title: "Договор о Неразглашении (NDA)",
        body: "1. ОБЩИЕ ПОЛОЖЕНИЯ\nЛюбая информация, полученная в ходе работы на внутреннем портале SentinelTech, является строго конфиденциальной и имеет гриф 'СОВЕРШЕННО СЕКРЕТНО'.\n\n2. ОБЯЗАННОСТИ СОТРУДНИКА\nСотрудник обязуется не разглашать третьим лицам информацию о методах, алгоритмах и программном обеспечении, используемом компанией. Фотографирование, копирование и экспорт данных за пределы изолированной среды строжайше запрещены.\n\n3. ИНТЕГРАЦИЯ С DIGITAL DREAMS\nПроект реализуется совместно с корпорацией DD. Все обнаруженные аномалии должны обрабатываться согласно объединённому протоку безопасности.\n\n4. ОТВЕТСТВЕННОСТЬ\nНарушение данного соглашения влечет за собой немедленную блокировку доступа, аннулирование контракта и передачу дела в службу внутренней безопасности для принятия дальнейших мер (протокол 'Стирание').",
      },
      tasks: {
        title: "Текущие Задания",
        new_badge: "1 НОВОЕ",
        op1_title: "Операция: Первый Шаг",
        op1_desc: "Ваша цель состоит в подготовке системы к дальнейшим манипуляциям. Следуйте строго по списку.",
        task1_title: "Запустить проверку файлов",
        task1_desc: "Используйте утилиту диагностики на главной панели портала.",
        task2_title: "Проверить диск 'C:'",
        task2_desc: "Осмотрите структуру файловой системы.",
      }
    },
    bios: {
      titles: {
        main: "Phoenix - AwardBIOS CMOS Setup Utility"
      },
      unstable_kernel: "! НЕСТАБИЛЬНОЕ ЯДРО !",
      cmd_title: "Командная строка",
      ps_title: "Администратор: Windows PowerShell",
      available_cmds: "Доступные команды:",
      help_hint: "Введите \"help\", чтобы увидеть доступные команды.",
      dev_mode_activated: "Режим разработки активирован. Откройте PowerShell.",
      not_recognized: "'{cmd}' не является внутренней или внешней командой.",
      connect_host: "- connect host : Установить соединение с хостом",
      host_discovered: "ХОСТ ОБНАРУЖЕН. Интерфейс PowerShell связан. Откройте PowerShell для продолжения.",
      connect_host_hint: "Попробуйте \"connect host\", чтобы установить соединение.",
      decrypt_core: "- decrypt core : Расшифровать ядро системы",
      core_decrypted: "ЯДРО РАСШИФРОВАНО. Используйте PowerShell для финального рукопожатия.",
      identity_failed: "Ошибка верификации личности.",
      handshake_req: "НЕОБХОДИМО_ФИНАЛЬНОЕ_РУКОПОЖАТИЕ.",
      core_encrypted: "Ядро зашифровано. Какой ключ?",
      hint_ny: "(Подсказка: N — провал, Y — победа)",
      verify_host: "Вы пытаетесь подключиться к хосту ({host})? Y/N",
      establishing_conn: "[УСТАНОВКА ЗАЩИЩЕННОГО СОЕДИНЕНИЯ...]",
      access_granted: "ДОСТУП РАЗРЕШЕН",
      type_run: "Введите /f run для продолжения.",
      cant_run: "ВАМ НЕ УДАСТСЯ СБЕЖАТЬ!",
      invalid_input: "Неверный ввод. Y/N.",
      access_denied_run: "Ошибка: ACCESS_DENIED. Команда должна быть /f run.",
      incorrect_key: "НЕВЕРНЫЙ КЛЮЧ.",
      try_again_fail: "Попробуйте снова или выберите N для провала.",
      init_verification: "> Инициализация проверки файлов...",
      calc_checksums: "> Вычисление контрольных сумм...",
      verification_fail: "Проверка завершена. Целостность системы: ОШИБКА.",
      await_override: "Ожидание административного переопределения (напр., reboot core)...",
      access_kernel: "> Доступ к секторам ядра...",
      rewrite_boot: "> Перезапись параметров загрузки...",
      reboot_init: "REBOOT_SEQUENCE_INITIALIZED: OK",
      rebooting: "перезагрузка...",
      ps_processing: "Обработка запроса ядра...",
      loading: "ЗАГРУЗКА ИНТЕРФЕЙСА BIOS...",
      tabs: {
        main: "Главная",
        advanced: "Дополнительно",
        security: "Безопасность",
        boot: "Загрузка",
        admin: "Администрирование",
        exit: "Выход"
      },
      admin_title: "Системное администрирование",
      admin: {
        system_core: "Ядро системы",
        cmd: "Командная строка",
        powershell: "PowerShell",
        network: "Сетевой стек",
        registry: "Редактор реестра"
      },
      status: {
        encrypted: "[ ЗАШИФРОВАНО ]",
        locked: "[ ЗАБЛОКИРОВАНО ]",
        live: "[ АКТИВНО ]"
      },
      empty: "ПУСТО...",
      stats: {
        title: "Статус Системы",
        cpu_temp: "Темп. ЦПУ:",
        fan_speed: "Скор. фана:",
        voltage: "Напряжение:",
        integrity: "Целостность:",
        critical: "КРИТИЧЕСКИЙ",
        ok: "ОК"
      }
    },
    defender: {
      file_moved: "файл перемещён в корзину",
      bin_emptied: "корзина очищена",
      bin_empty: "корзина пуста, очищать нечего",
      title: "ЗАЩИТНИК WINDOWS",
      status_critical: "КРИТИЧЕСКОЕ_ЗАРАЖЕНИЕ",
      attention: "Требуется внимание",
      attention_desc: "В памяти обнаружены вредоносные сигнатуры. Рекомендуется немедленное сканирование.",
      start_scan: "Начать глубокое сканирование",
      analyzing: "Анализ секторов...",
      completed: "Завершено",
      severity: "Опасность: ВЫСОКАЯ",
      quarantine: "Карантин",
      delete: "Удалить",
      ignore: "Игнорировать",
      threats_found: "Обнаружены угрозы",
      threats_removed: "Все обнаруженные угрозы были успешно удалены.",
    },
    ending: {
      konets: "конец",
      thanks: "спасибо за прохождение 1 части",
      last: "теперь просто послушайте музыку",
      bsod_stop_code: "Код остановки:",
      bsod_what_failed: "Что вызвало проблему:",
      bsod_additional_info: "Дополнительная информация:",
      bsod_fault_desc: "Произошла критическая ошибка системной платы.",
      bsod_init_failed: "Инициализация оборудования не удалась. Целостность системы не гарантирована.",
      full_history: "ПОЛНАЯ ИСТОРИЯ ЗАВЕРШЕНА",
      congrats: "Поздравляем! Вы прошли весь доступный сюжет PC MASTER OS. Вы успешно справились со всеми угрозами и раскрыли планы Digital Dreams.",
      restart: "ПЕРЕЗАПУСК"
    }
  }
};

export type TranslationKey = keyof typeof translations.en;

export const t = (path: string): string => {
  const language = useGameStore.getState().language || 'ru';
  const keys = path.split('.');
  let result: any = translations[language as keyof typeof translations];
  
  for (const key of keys) {
    if (result && result[key]) {
      result = result[key];
    } else {
      // Fallback to English if key missing in Russian
      let fallback: any = translations.en;
      for (const fKey of keys) {
        if (fallback && fallback[fKey]) fallback = fallback[fKey];
        else return path; // Return path if totally missing
      }
      return fallback;
    }
  }
  
  return typeof result === 'string' ? result : path;
};
