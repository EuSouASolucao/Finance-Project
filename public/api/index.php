<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$config = require __DIR__ . '/config.php';

function json_response($data, int $status = 200): void {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function input_json(): array {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw ?: '{}', true);
    return is_array($data) ? $data : [];
}

function db(): PDO {
    static $pdo = null;
    global $config;

    if ($pdo instanceof PDO) return $pdo;

    $dsn = "mysql:host={$config['db_host']};port={$config['db_port']};dbname={$config['db_name']};charset=utf8mb4";
    $pdo = new PDO($dsn, $config['db_user'], $config['db_password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    ensure_schema($pdo);

    return $pdo;
}

function mysql_column_exists(PDO $pdo, string $table, string $column): bool {
    try {
        $stmt = $pdo->prepare(
            'SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?'
        );
        $stmt->execute([$table, $column]);

        return (int) $stmt->fetchColumn() > 0;
    } catch (Throwable $e) {
        $safeTable = preg_replace('/[^a-zA-Z0-9_]/', '', $table);
        $stmt = $pdo->prepare("SHOW COLUMNS FROM `{$safeTable}` LIKE ?");
        $stmt->execute([$column]);

        return (bool) $stmt->fetch();
    }
}

function ensure_schema(PDO $pdo): void {
    static $checked = false;
    if ($checked) {
        return;
    }
    $checked = true;

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS users (
            id CHAR(36) PRIMARY KEY,
            name VARCHAR(160) NOT NULL,
            email VARCHAR(160) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            phone VARCHAR(40),
            document VARCHAR(40),
            plan VARCHAR(40) DEFAULT 'Sem Plano',
            role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
            avatar_url TEXT,
            preferred_currency VARCHAR(10) NOT NULL DEFAULT 'BRL',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    if (!mysql_column_exists($pdo, 'users', 'role')) {
        try {
            $pdo->exec("ALTER TABLE users ADD COLUMN role ENUM('user', 'admin') NOT NULL DEFAULT 'user' AFTER plan");
        } catch (Throwable $e) {
            $pdo->exec("ALTER TABLE users ADD COLUMN role ENUM('user', 'admin') NOT NULL DEFAULT 'user'");
        }
    }

    if (!mysql_column_exists($pdo, 'users', 'preferred_currency')) {
        try {
            $pdo->exec("ALTER TABLE users ADD COLUMN preferred_currency VARCHAR(10) NOT NULL DEFAULT 'BRL' AFTER avatar_url");
        } catch (Throwable $e) {
            $pdo->exec("ALTER TABLE users ADD COLUMN preferred_currency VARCHAR(10) NOT NULL DEFAULT 'BRL'");
        }
    }

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS purchase_invoices (
            id CHAR(36) PRIMARY KEY,
            plan_name VARCHAR(80) NOT NULL,
            plan_price DECIMAL(12,2) NOT NULL,
            customer_name VARCHAR(160),
            customer_email VARCHAR(160),
            customer_phone VARCHAR(40),
            status ENUM('pending', 'paid', 'cancelled') NOT NULL DEFAULT 'pending',
            source VARCHAR(60) NOT NULL DEFAULT 'site_cart',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_purchase_invoices_status (status),
            INDEX idx_purchase_invoices_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    if (!mysql_column_exists($pdo, 'purchase_invoices', 'user_id')) {
        try {
            $pdo->exec('ALTER TABLE purchase_invoices ADD COLUMN user_id CHAR(36) NULL AFTER customer_phone');
            $pdo->exec('ALTER TABLE purchase_invoices ADD INDEX idx_purchase_invoices_user (user_id)');
        } catch (Throwable $e) {
            // ignore migration conflicts on restricted hosts
        }
    }

    if (!mysql_column_exists($pdo, 'purchase_invoices', 'paid_at')) {
        try {
            $pdo->exec('ALTER TABLE purchase_invoices ADD COLUMN paid_at TIMESTAMP NULL DEFAULT NULL AFTER updated_at');
        } catch (Throwable $e) {
        }
    }

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS site_payment_settings (
            id TINYINT UNSIGNED PRIMARY KEY DEFAULT 1,
            pix_copy_paste TEXT,
            instructions_public TEXT,
            webhook_secret VARCHAR(255) NOT NULL DEFAULT '',
            webhook_enabled TINYINT(1) NOT NULL DEFAULT 0,
            gateways_json TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    try {
        $pdo->exec('INSERT IGNORE INTO site_payment_settings (id, webhook_enabled) VALUES (1, 0)');
    } catch (Throwable $e) {
    }

    if (!mysql_column_exists($pdo, 'site_payment_settings', 'gateways_json')) {
        try {
            $pdo->exec('ALTER TABLE site_payment_settings ADD COLUMN gateways_json TEXT NULL');
        } catch (Throwable $e) {
        }
    }

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS plan_permission_profiles (
            plan_key VARCHAR(40) PRIMARY KEY,
            permissions_json TEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS admin_audit_log (
            id CHAR(36) PRIMARY KEY,
            actor_user_id CHAR(36) NOT NULL,
            actor_email VARCHAR(160) NOT NULL,
            action VARCHAR(80) NOT NULL,
            entity_type VARCHAR(80) NOT NULL,
            entity_id VARCHAR(120) NULL,
            summary VARCHAR(512) NOT NULL,
            details_json MEDIUMTEXT NULL,
            ip_address VARCHAR(45) NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_admin_audit_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
}

function b64url_encode(string $value): string {
    return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
}

function b64url_decode(string $value): string {
    return base64_decode(strtr($value, '-_', '+/')) ?: '';
}

function create_token(array $user): string {
    global $config;
    $header = b64url_encode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
    $payload = b64url_encode(json_encode([
        'id' => $user['id'],
        'email' => $user['email'],
        'name' => $user['name'],
        'role' => $user['role'] ?? 'user',
        'exp' => time() + (7 * 24 * 60 * 60),
    ]));
    $signature = b64url_encode(hash_hmac('sha256', "$header.$payload", $config['jwt_secret'], true));
    return "$header.$payload.$signature";
}

function set_auth_cookie(string $token): void {
    $secure = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
    $expires = time() + (7 * 24 * 60 * 60);
    $path = '/financeiro';

    if (PHP_VERSION_ID >= 70300) {
        setcookie('financeapp_token', $token, [
            'expires' => $expires,
            'path' => $path,
            'secure' => $secure,
            'httponly' => true,
            'samesite' => 'Lax',
        ]);

        return;
    }

    // PHP anterior a 7.3: SameSite via prefixo no path (fallback)
    setcookie('financeapp_token', $token, $expires, $path . '; samesite=Lax', '', $secure, true);
}

function authorization_header(): string {
    $header = $_SERVER['HTTP_AUTHORIZATION']
        ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
        ?? $_SERVER['Authorization']
        ?? '';

    if (!$header && function_exists('getallheaders')) {
        $headers = getallheaders();
        $header = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    }

    return trim((string) $header);
}

function auth_user_id(): string {
    global $config;
    $header = authorization_header();
    $token = strpos($header, 'Bearer ') === 0 ? substr($header, 7) : '';
    if (!$token && !empty($_GET['auth_token'])) {
        $token = (string) $_GET['auth_token'];
    }
    if (!$token && !empty($_COOKIE['financeapp_token'])) {
        $token = (string) $_COOKIE['financeapp_token'];
    }

    if (!$token) json_response(['message' => 'Token de autenticação não informado.'], 401);

    $parts = explode('.', $token);
    if (count($parts) !== 3) json_response(['message' => 'Sessão inválida.'], 401);

    [$encodedHeader, $encodedPayload, $signature] = $parts;
    $expected = b64url_encode(hash_hmac('sha256', "$encodedHeader.$encodedPayload", $config['jwt_secret'], true));

    if (!hash_equals($expected, $signature)) json_response(['message' => 'Sessão inválida.'], 401);

    $payload = json_decode(b64url_decode($encodedPayload), true);
    if (!is_array($payload) || ($payload['exp'] ?? 0) < time()) {
        json_response(['message' => 'Sessão expirada.'], 401);
    }

    return (string) $payload['id'];
}

function optional_auth_user_id(): ?string {
    global $config;
    $header = authorization_header();
    $token = strpos($header, 'Bearer ') === 0 ? substr($header, 7) : '';
    if (!$token && !empty($_GET['auth_token'])) {
        $token = (string) $_GET['auth_token'];
    }
    if (!$token && !empty($_COOKIE['financeapp_token'])) {
        $token = (string) $_COOKIE['financeapp_token'];
    }
    if (!$token) {
        return null;
    }

    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return null;
    }

    [$encodedHeader, $encodedPayload, $signature] = $parts;
    $expected = b64url_encode(hash_hmac('sha256', "$encodedHeader.$encodedPayload", $config['jwt_secret'], true));
    if (!hash_equals($expected, $signature)) {
        return null;
    }

    $payload = json_decode(b64url_decode($encodedPayload), true);
    if (!is_array($payload) || ($payload['exp'] ?? 0) < time()) {
        return null;
    }

    return (string) $payload['id'];
}

function payment_settings_row(PDO $pdo): array {
    $stmt = $pdo->prepare('SELECT * FROM site_payment_settings WHERE id = 1');
    $stmt->execute();
    $row = $stmt->fetch();

    return $row ?: [
        'id' => 1,
        'pix_copy_paste' => '',
        'instructions_public' => '',
        'webhook_secret' => '',
        'webhook_enabled' => 0,
        'gateways_json' => null,
    ];
}

function default_payment_gateways(): array {
    return [
        'mercadoPago' => ['enabled' => false, 'checkoutUrl' => ''],
        'paypal' => ['enabled' => false, 'checkoutUrl' => ''],
        'pagseguro' => ['enabled' => false, 'checkoutUrl' => ''],
        'infinitiPay' => ['enabled' => false, 'checkoutUrl' => ''],
    ];
}

function decode_payment_gateways(?string $json): array {
    $defaults = default_payment_gateways();
    if (!$json || trim($json) === '') {
        return $defaults;
    }

    $decoded = json_decode($json, true);
    if (!is_array($decoded)) {
        return $defaults;
    }

    foreach ($defaults as $key => $_) {
        if (!isset($decoded[$key]) || !is_array($decoded[$key])) {
            continue;
        }

        $defaults[$key]['enabled'] = !empty($decoded[$key]['enabled']);
        $defaults[$key]['checkoutUrl'] = trim((string) ($decoded[$key]['checkoutUrl'] ?? ''));
    }

    return $defaults;
}

function encode_payment_gateways(array $gateways): string {
    return json_encode($gateways, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}

function map_payment_settings_public(array $row): array {
    return [
        'pixCopyPaste' => $row['pix_copy_paste'] ?? '',
        'instructionsPublic' => $row['instructions_public'] ?? '',
        'gateways' => decode_payment_gateways($row['gateways_json'] ?? null),
    ];
}

function map_payment_settings_admin(array $row): array {
    $secret = trim((string) ($row['webhook_secret'] ?? ''));

    return [
        'pixCopyPaste' => $row['pix_copy_paste'] ?? '',
        'instructionsPublic' => $row['instructions_public'] ?? '',
        'webhookEnabled' => !empty($row['webhook_enabled']),
        'webhookSecretSet' => $secret !== '',
        'gateways' => decode_payment_gateways($row['gateways_json'] ?? null),
    ];
}

/** Ao marcar fatura como paga: atualiza plano do cliente vinculado (user_id ou e-mail). */
function apply_invoice_paid_side_effects(PDO $pdo, array $invoice): void {
    if (($invoice['status'] ?? '') !== 'paid') {
        return;
    }

    $plan = trim((string) ($invoice['plan_name'] ?? ''));
    if ($plan === '') {
        return;
    }

    if (!empty($invoice['user_id'])) {
        $stmt = $pdo->prepare('UPDATE users SET plan = ? WHERE id = ?');
        $stmt->execute([$plan, $invoice['user_id']]);

        return;
    }

    $email = trim((string) ($invoice['customer_email'] ?? ''));
    if ($email !== '') {
        $stmt = $pdo->prepare('UPDATE users SET plan = ? WHERE email = ?');
        $stmt->execute([$plan, $email]);
    }
}

function normalize_preferred_currency(?string $raw): string {
    $allowed = ['BRL', 'USD', 'EUR', 'GBP'];
    $value = strtoupper(trim((string) ($raw ?? 'BRL')));
    return in_array($value, $allowed, true) ? $value : 'BRL';
}

function plan_tier_from_plan(?string $plan): string {
    $p = trim((string) $plan);
    if ($p === 'Profissional') {
        return 'profissional';
    }
    if ($p === 'Empresarial') {
        return 'empresarial';
    }

    return 'essencial';
}

function permission_schema_defaults(string $plan): array {
    $tier = plan_tier_from_plan($plan);
    $proPlus = $tier !== 'essencial';
    $emp = $tier === 'empresarial';

    return [
        'panelDashboard' => true,
        'panelTransactions' => true,
        'panelReports' => true,
        'panelGoals' => true,
        'panelPayments' => true,
        'panelReceipts' => true,
        'panelInvestmentAi' => true,
        'panelProfessional' => true,
        'panelSettings' => true,
        'categoryBudget' => $proPlus,
        'smartAlerts' => $proPlus,
        'exportData' => $proPlus,
        'professionalAutomation' => $proPlus,
        'multiUser' => $emp,
    ];
}

function permission_keys(): array {
    return array_keys(permission_schema_defaults('Sem Plano'));
}

function permission_all_true(): array {
    return array_fill_keys(permission_keys(), true);
}

function fetch_effective_permissions(string $plan): array {
    $defaults = permission_schema_defaults($plan);

    try {
        $stmt = db()->prepare('SELECT permissions_json FROM plan_permission_profiles WHERE plan_key = ?');
        $stmt->execute([$plan]);
        $row = $stmt->fetch();
        if (!$row || trim((string) ($row['permissions_json'] ?? '')) === '') {
            return $defaults;
        }

        $decoded = json_decode($row['permissions_json'], true);
        if (!is_array($decoded)) {
            return $defaults;
        }

        foreach ($defaults as $k => $_) {
            if (array_key_exists($k, $decoded)) {
                $defaults[$k] = (bool) $decoded[$k];
            }
        }
    } catch (Throwable $e) {
        return $defaults;
    }

    return $defaults;
}

function effective_permissions_for_user_row(array $row): array {
    if (($row['role'] ?? 'user') === 'admin') {
        return permission_all_true();
    }

    $plan = trim((string) ($row['plan'] ?? '')) ?: 'Sem Plano';

    return fetch_effective_permissions($plan);
}

function user_has_permission(array $userRow, string $key): bool {
    if (($userRow['role'] ?? 'user') === 'admin') {
        return true;
    }

    $perms = effective_permissions_for_user_row($userRow);

    return !empty($perms[$key]);
}

function assert_user_permission_row(array $userRow, string $key): void {
    if (!user_has_permission($userRow, $key)) {
        json_response(['message' => 'Sem permissão para esta funcionalidade no seu perfil de plano.'], 403);
    }
}

function assert_user_permission(string $userId, string $key): void {
    assert_user_permission_row(auth_user_row($userId), $key);
}

function canonical_assignment_plans(): array {
    return ['Sem Plano', 'Essencial', 'Profissional', 'Empresarial'];
}

function normalize_permissions_from_request(string $planKey, array $incoming): array {
    $defaults = permission_schema_defaults($planKey);
    foreach ($defaults as $k => $_) {
        if (array_key_exists($k, $incoming)) {
            $defaults[$k] = (bool) $incoming[$k];
        }
    }

    return $defaults;
}

function user_payload(array $row): array {
    return [
        'id' => $row['id'],
        'name' => $row['name'],
        'email' => $row['email'],
        'phone' => $row['phone'] ?? '',
        'document' => $row['document'] ?? '',
        'plan' => $row['plan'] ?? 'Sem Plano',
        'role' => $row['role'] ?? 'user',
        'avatarUrl' => $row['avatar_url'] ?? '',
        'preferredCurrency' => normalize_preferred_currency($row['preferred_currency'] ?? 'BRL'),
        'permissions' => effective_permissions_for_user_row($row),
    ];
}

function admin_user_payload(array $row): array {
    return [
        'id' => $row['id'],
        'name' => $row['name'],
        'email' => $row['email'],
        'phone' => $row['phone'] ?? '',
        'document' => $row['document'] ?? '',
        'plan' => $row['plan'] ?? 'Sem Plano',
        'role' => $row['role'] ?? 'user',
        'createdAt' => $row['created_at'],
        'transactionCount' => (int) ($row['transaction_count'] ?? 0),
        'incomeTotal' => (float) ($row['income_total'] ?? 0),
        'expenseTotal' => (float) ($row['expense_total'] ?? 0),
    ];
}

function client_ip(): string {
    return trim((string) ($_SERVER['REMOTE_ADDR'] ?? ''));
}

/** Registo de alterações feitas no painel administrativo (não falha o pedido principal). */
function admin_audit_write(PDO $pdo, array $actorRow, string $action, string $entityType, ?string $entityId, string $summary, array $details = []): void {
    try {
        $id = bin2hex(random_bytes(16));
        $stmt = $pdo->prepare(
            'INSERT INTO admin_audit_log (id, actor_user_id, actor_email, action, entity_type, entity_id, summary, details_json, ip_address)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $id,
            (string) ($actorRow['id'] ?? ''),
            (string) ($actorRow['email'] ?? ''),
            $action,
            $entityType,
            $entityId,
            mb_substr($summary, 0, 512),
            json_encode($details, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?: '{}',
            client_ip() !== '' ? client_ip() : null,
        ]);
    } catch (Throwable $e) {
        error_log('admin_audit_write: ' . $e->getMessage());
    }
}

function map_audit_entry(array $row): array {
    $details = [];
    if (!empty($row['details_json'])) {
        $decoded = json_decode((string) $row['details_json'], true);
        if (is_array($decoded)) {
            $details = $decoded;
        }
    }

    return [
        'id' => $row['id'],
        'actorUserId' => $row['actor_user_id'],
        'actorEmail' => $row['actor_email'],
        'action' => $row['action'],
        'entityType' => $row['entity_type'],
        'entityId' => $row['entity_id'],
        'summary' => $row['summary'],
        'details' => $details,
        'ipAddress' => $row['ip_address'] ?? '',
        'createdAt' => $row['created_at'],
    ];
}

function require_admin_user(string $userId): array {
    $stmt = db()->prepare('SELECT * FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    if (!$user) json_response(['message' => 'Usuário não encontrado.'], 404);
    if (($user['role'] ?? 'user') !== 'admin') {
        json_response(['message' => 'Acesso restrito ao administrador.'], 403);
    }

    return $user;
}

/** Cache por pedido — várias rotas consultam o mesmo utilizador autenticado. */
function auth_user_row(string $userId): array {
    static $cachedId = null;
    static $cachedRow = null;

    if ($cachedId === $userId && is_array($cachedRow)) {
        return $cachedRow;
    }

    $stmt = db()->prepare('SELECT * FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    $row = $stmt->fetch();

    if (!$row) {
        json_response(['message' => 'Usuário não encontrado.'], 404);
    }

    $cachedId = $userId;
    $cachedRow = $row;

    return $cachedRow;
}

function map_transaction(array $row): array {
    return [
        'id' => $row['id'],
        'type' => $row['type'],
        'description' => $row['description'],
        'amount' => (float) $row['amount'],
        'category' => $row['category'],
        'date' => $row['transaction_date'],
        'paymentStatus' => $row['payment_status'],
        'createdAt' => $row['created_at'],
    ];
}

function map_goal(array $row): array {
    return [
        'id' => $row['id'],
        'title' => $row['title'],
        'targetAmount' => (float) $row['target_amount'],
        'currentAmount' => (float) $row['current_amount'],
        'deadline' => $row['deadline'],
        'createdAt' => $row['created_at'],
    ];
}

function map_budget(array $row): array {
    return [
        'id' => $row['id'],
        'category' => $row['category'],
        'monthlyLimit' => (float) $row['monthly_limit'],
        'alertPercentage' => (float) $row['alert_percentage'],
        'createdAt' => $row['created_at'],
    ];
}

function map_recurring(array $row): array {
    return [
        'id' => $row['id'],
        'description' => $row['description'],
        'type' => $row['type'],
        'amount' => (float) $row['amount'],
        'category' => $row['category'],
        'dayOfMonth' => (int) $row['day_of_month'],
        'paymentStatus' => $row['payment_status'],
        'active' => (bool) $row['active'],
        'createdAt' => $row['created_at'],
    ];
}

function map_card(array $row): array {
    return [
        'id' => $row['id'],
        'name' => $row['name'],
        'limit' => (float) $row['card_limit'],
        'closingDay' => (int) $row['closing_day'],
        'dueDay' => (int) $row['due_day'],
        'currentInvoice' => (float) $row['current_invoice'],
        'createdAt' => $row['created_at'],
    ];
}

function map_access(array $row): array {
    return [
        'id' => $row['id'],
        'name' => $row['name'],
        'email' => $row['email'],
        'role' => $row['role'],
        'permission' => $row['permission'],
        'createdAt' => $row['created_at'],
    ];
}

function map_purchase_invoice(array $row): array {
    $issuerName = $row['issuer_user_name'] ?? null;
    $issuerEmail = $row['issuer_user_email'] ?? null;

    return [
        'id' => $row['id'],
        'planName' => $row['plan_name'],
        'planPrice' => (float) $row['plan_price'],
        'customerName' => $row['customer_name'] ?? '',
        'customerEmail' => $row['customer_email'] ?? '',
        'customerPhone' => $row['customer_phone'] ?? '',
        'userId' => $row['user_id'] ?? null,
        'issuerName' => $issuerName ?? ($row['customer_name'] ?? ''),
        'issuerEmail' => $issuerEmail ?? ($row['customer_email'] ?? ''),
        'status' => $row['status'],
        'source' => $row['source'],
        'createdAt' => $row['created_at'],
        'paidAt' => $row['paid_at'] ?? null,
    ];
}

$path = $_GET['route'] ?? '';
if (!$path) {
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '';
    $path = preg_replace('#.*/api#', '', $path);
    $path = preg_replace('#^/index\.php#', '', $path);
}
$path = '/' . trim((string) $path, '/');
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($path === '/health') {
        db()->query('SELECT 1');
        json_response(['status' => 'ok', 'database' => 'connected']);
    }

    if ($path === '/checkout/invoices' && $method === 'POST') {
        $data = input_json();
        $planName = trim((string) ($data['planName'] ?? ''));
        $planPrice = (float) ($data['planPrice'] ?? 0);

        if (!$planName || $planPrice <= 0) {
            json_response(['message' => 'Plano e valor são obrigatórios para gerar a fatura.'], 400);
        }

        $attachedUserId = optional_auth_user_id();
        $id = bin2hex(random_bytes(16));
        $stmt = db()->prepare('
            INSERT INTO purchase_invoices (id, plan_name, plan_price, customer_name, customer_email, customer_phone, user_id, status, source)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ');
        $stmt->execute([
            $id,
            $planName,
            $planPrice,
            trim((string) ($data['customerName'] ?? 'Visitante do site')),
            trim((string) ($data['customerEmail'] ?? '')),
            trim((string) ($data['customerPhone'] ?? '')),
            $attachedUserId,
            'pending',
            $attachedUserId ? 'panel_checkout' : 'site_cart',
        ]);

        $stmt = db()->prepare('SELECT * FROM purchase_invoices WHERE id = ?');
        $stmt->execute([$id]);
        json_response(['invoice' => map_purchase_invoice($stmt->fetch())], 201);
    }

    if ($path === '/payment-settings/public' && $method === 'GET') {
        $pdo = db();
        json_response(['settings' => map_payment_settings_public(payment_settings_row($pdo))]);
    }

    if ($path === '/webhooks/payment' && $method === 'POST') {
        $data = input_json();
        $invoiceId = trim((string) ($data['invoiceId'] ?? ''));
        $signature = trim((string) ($data['signature'] ?? ''));

        if (!$invoiceId || !$signature) {
            json_response(['message' => 'invoiceId e signature são obrigatórios.'], 400);
        }

        $pdo = db();
        $settings = payment_settings_row($pdo);
        $secret = trim((string) ($settings['webhook_secret'] ?? ''));
        $enabled = !empty($settings['webhook_enabled']);

        if (!$enabled || $secret === '') {
            json_response(['message' => 'Webhook automático desativado ou segredo não configurado.'], 403);
        }

        $expected = hash_hmac('sha256', $invoiceId, $secret);
        if (!hash_equals($expected, $signature)) {
            json_response(['message' => 'Assinatura inválida.'], 403);
        }

        $stmt = $pdo->prepare('SELECT * FROM purchase_invoices WHERE id = ?');
        $stmt->execute([$invoiceId]);
        $inv = $stmt->fetch();
        if (!$inv) {
            json_response(['message' => 'Fatura não encontrada.'], 404);
        }

        if (($inv['status'] ?? '') === 'paid') {
            json_response(['invoice' => map_purchase_invoice($inv)]);
        }

        $upd = $pdo->prepare("UPDATE purchase_invoices SET status = 'paid', paid_at = NOW() WHERE id = ? AND status = 'pending'");
        $upd->execute([$invoiceId]);

        $stmt = $pdo->prepare('SELECT * FROM purchase_invoices WHERE id = ?');
        $stmt->execute([$invoiceId]);
        $inv = $stmt->fetch();
        apply_invoice_paid_side_effects($pdo, $inv);
        json_response(['invoice' => map_purchase_invoice($inv)]);
    }

    if ($path === '/auth/register' && $method === 'POST') {
        $data = input_json();
        if (empty($data['name']) || empty($data['email']) || empty($data['password'])) {
            json_response(['message' => 'Nome, e-mail e senha são obrigatórios.'], 400);
        }

        $pdo = db();
        $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
        $stmt->execute([$data['email']]);
        if ($stmt->fetch()) json_response(['message' => 'Este e-mail já está cadastrado.'], 409);

        $id = bin2hex(random_bytes(16));
        $hash = password_hash($data['password'], PASSWORD_BCRYPT);
        $stmt = $pdo->prepare('INSERT INTO users (id, name, email, password_hash, plan, preferred_currency) VALUES (?, ?, ?, ?, ?, ?)');
        $stmt->execute([$id, $data['name'], $data['email'], $hash, 'Sem Plano', 'BRL']);

        $stmt = $pdo->prepare('SELECT * FROM users WHERE id = ?');
        $stmt->execute([$id]);
        $user = $stmt->fetch();
        $token = create_token($user);
        set_auth_cookie($token);
        json_response(['user' => user_payload($user), 'token' => $token], 201);
    }

    if ($path === '/auth/login' && $method === 'POST') {
        $data = input_json();
        $stmt = db()->prepare('SELECT * FROM users WHERE email = ?');
        $stmt->execute([$data['email'] ?? '']);
        $user = $stmt->fetch();

        if (!$user || !password_verify($data['password'] ?? '', $user['password_hash'])) {
            json_response(['message' => 'E-mail ou senha inválidos.'], 401);
        }

        $token = create_token($user);
        set_auth_cookie($token);
        json_response(['user' => user_payload($user), 'token' => $token]);
    }

    if ($path === '/auth/me') {
        $userId = auth_user_id();

        if ($method === 'PATCH') {
            $data = input_json();
            $pref = normalize_preferred_currency($data['preferredCurrency'] ?? null);
            $stmtCurrent = db()->prepare('SELECT * FROM users WHERE id = ?');
            $stmtCurrent->execute([$userId]);
            $current = $stmtCurrent->fetch();
            if (!$current) {
                json_response(['message' => 'Usuário não encontrado.'], 404);
            }

            $planLocked = trim((string) ($current['plan'] ?? 'Sem Plano')) ?: 'Sem Plano';

            $stmt = db()->prepare('UPDATE users SET name = ?, email = ?, phone = ?, document = ?, plan = ?, avatar_url = ?, preferred_currency = ? WHERE id = ?');
            $stmt->execute([
                $data['name'] ?? '',
                $data['email'] ?? '',
                $data['phone'] ?? null,
                $data['document'] ?? null,
                $planLocked,
                $data['avatarUrl'] ?? null,
                $pref,
                $userId,
            ]);
        }

        $stmt = db()->prepare('SELECT * FROM users WHERE id = ?');
        $stmt->execute([$userId]);
        json_response(['user' => user_payload($stmt->fetch())]);
    }

    $userId = auth_user_id();

    if (preg_match('#^/billing/invoices/([^/]+)$#', $path, $match) && $method === 'GET') {
        $stmt = db()->prepare('SELECT email FROM users WHERE id = ?');
        $stmt->execute([$userId]);
        $currentUser = $stmt->fetch();
        if (!$currentUser) json_response(['message' => 'Usuário não encontrado.'], 404);

        $stmt = db()->prepare('SELECT * FROM purchase_invoices WHERE id = ? AND (user_id = ? OR customer_email = ?)');
        $stmt->execute([$match[1], $userId, $currentUser['email']]);
        $row = $stmt->fetch();
        if (!$row) json_response(['message' => 'Fatura não encontrada.'], 404);

        json_response(['invoice' => map_purchase_invoice($row)]);
    }

    if ($path === '/billing/invoices' && $method === 'POST') {
        $data = input_json();
        $planName = trim((string) ($data['planName'] ?? ''));
        $planPrice = (float) ($data['planPrice'] ?? 0);

        if (!$planName || $planPrice <= 0) {
            json_response(['message' => 'Plano e valor são obrigatórios para gerar a fatura.'], 400);
        }

        $pdo = db();
        $stmt = $pdo->prepare('SELECT name, email, phone FROM users WHERE id = ?');
        $stmt->execute([$userId]);
        $u = $stmt->fetch();
        if (!$u) json_response(['message' => 'Usuário não encontrado.'], 404);

        $id = bin2hex(random_bytes(16));
        $stmt = $pdo->prepare('
            INSERT INTO purchase_invoices (id, plan_name, plan_price, customer_name, customer_email, customer_phone, user_id, status, source)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ');
        $stmt->execute([
            $id,
            $planName,
            $planPrice,
            trim((string) ($data['customerName'] ?? $u['name'] ?? '')),
            trim((string) ($data['customerEmail'] ?? $u['email'] ?? '')),
            trim((string) ($data['customerPhone'] ?? $u['phone'] ?? '')),
            $userId,
            'pending',
            'panel_checkout',
        ]);

        $stmt = $pdo->prepare('SELECT * FROM purchase_invoices WHERE id = ?');
        $stmt->execute([$id]);
        json_response(['invoice' => map_purchase_invoice($stmt->fetch())], 201);
    }

    if ($path === '/billing/invoices' && $method === 'GET') {
        $stmt = db()->prepare('SELECT email FROM users WHERE id = ?');
        $stmt->execute([$userId]);
        $currentUser = $stmt->fetch();
        if (!$currentUser) json_response(['message' => 'Usuário não encontrado.'], 404);

        $stmt = db()->prepare('SELECT * FROM purchase_invoices WHERE user_id = ? OR customer_email = ? ORDER BY created_at DESC');
        $stmt->execute([$userId, $currentUser['email']]);
        json_response(['invoices' => array_map('map_purchase_invoice', $stmt->fetchAll())]);
    }

    if ($path === '/admin/summary' && $method === 'GET') {
        require_admin_user($userId);

        $summary = [];
        $summary['totalUsers'] = (int) db()->query('SELECT COUNT(*) AS total FROM users')->fetch()['total'];
        $summary['adminUsers'] = (int) db()->query("SELECT COUNT(*) AS total FROM users WHERE role = 'admin'")->fetch()['total'];
        $summary['transactions'] = (int) db()->query('SELECT COUNT(*) AS total FROM transactions')->fetch()['total'];
        $summary['incomeTotal'] = (float) db()->query("SELECT COALESCE(SUM(amount), 0) AS total FROM transactions WHERE type = 'income'")->fetch()['total'];
        $summary['expenseTotal'] = (float) db()->query("SELECT COALESCE(SUM(amount), 0) AS total FROM transactions WHERE type = 'expense'")->fetch()['total'];
        $summary['goals'] = (int) db()->query('SELECT COUNT(*) AS total FROM financial_goals')->fetch()['total'];
        $summary['recurringTransactions'] = (int) db()->query('SELECT COUNT(*) AS total FROM recurring_transactions')->fetch()['total'];
        $summary['receipts'] = (int) db()->query('SELECT COUNT(*) AS total FROM receipts')->fetch()['total'];
        $summary['purchaseInvoices'] = (int) db()->query('SELECT COUNT(*) AS total FROM purchase_invoices')->fetch()['total'];
        $summary['pendingInvoices'] = (int) db()->query("SELECT COUNT(*) AS total FROM purchase_invoices WHERE status = 'pending'")->fetch()['total'];
        $summary['paidInvoices'] = (int) db()->query("SELECT COUNT(*) AS total FROM purchase_invoices WHERE status = 'paid'")->fetch()['total'];
        $summary['cancelledInvoices'] = (int) db()->query("SELECT COUNT(*) AS total FROM purchase_invoices WHERE status = 'cancelled'")->fetch()['total'];
        $summary['invoiceTotal'] = (float) db()->query("SELECT COALESCE(SUM(plan_price), 0) AS total FROM purchase_invoices WHERE status = 'pending'")->fetch()['total'];
        $summary['paidInvoiceTotal'] = (float) db()->query("SELECT COALESCE(SUM(plan_price), 0) AS total FROM purchase_invoices WHERE status = 'paid'")->fetch()['total'];
        $summary['cancelledInvoiceTotal'] = (float) db()->query("SELECT COALESCE(SUM(plan_price), 0) AS total FROM purchase_invoices WHERE status = 'cancelled'")->fetch()['total'];

        $stmt = db()->query('SELECT plan, COUNT(*) AS total FROM users GROUP BY plan ORDER BY total DESC');
        $summary['plans'] = $stmt->fetchAll();

        json_response(['summary' => $summary]);
    }

    if ($path === '/admin/users' && $method === 'GET') {
        require_admin_user($userId);

        $stmt = db()->query("
            SELECT
                u.id,
                u.name,
                u.email,
                u.phone,
                u.document,
                u.plan,
                u.role,
                u.created_at,
                COUNT(t.id) AS transaction_count,
                COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) AS income_total,
                COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) AS expense_total
            FROM users u
            LEFT JOIN transactions t ON t.user_id = u.id
            GROUP BY u.id, u.name, u.email, u.phone, u.document, u.plan, u.role, u.created_at
            ORDER BY u.created_at DESC
        ");

        json_response(['users' => array_map('admin_user_payload', $stmt->fetchAll())]);
    }

    if ($path === '/admin/invoices' && $method === 'GET') {
        require_admin_user($userId);
        $stmt = db()->query('
            SELECT pi.*, u.name AS issuer_user_name, u.email AS issuer_user_email
            FROM purchase_invoices pi
            LEFT JOIN users u ON u.id = pi.user_id
            ORDER BY pi.created_at DESC
            LIMIT 100
        ');
        json_response(['invoices' => array_map('map_purchase_invoice', $stmt->fetchAll())]);
    }

    if ($path === '/admin/payment-settings' && $method === 'GET') {
        require_admin_user($userId);
        json_response(['settings' => map_payment_settings_admin(payment_settings_row(db()))]);
    }

    if ($path === '/admin/payment-settings' && $method === 'PATCH') {
        $adminActor = require_admin_user($userId);
        $data = input_json();
        $pdo = db();
        $row = payment_settings_row($pdo);

        $pix = array_key_exists('pixCopyPaste', $data) ? (string) $data['pixCopyPaste'] : ($row['pix_copy_paste'] ?? '');
        $instr = array_key_exists('instructionsPublic', $data) ? (string) $data['instructionsPublic'] : ($row['instructions_public'] ?? '');
        $webhookEnabled = array_key_exists('webhookEnabled', $data) ? (!empty($data['webhookEnabled']) ? 1 : 0) : (int) ($row['webhook_enabled'] ?? 0);

        $secret = trim((string) ($row['webhook_secret'] ?? ''));
        if (!empty($data['clearWebhookSecret'])) {
            $secret = '';
        } elseif (trim((string) ($data['webhookSecret'] ?? '')) !== '') {
            $secret = trim((string) $data['webhookSecret']);
        }

        $gateways = decode_payment_gateways($row['gateways_json'] ?? null);
        if (isset($data['gateways']) && is_array($data['gateways'])) {
            foreach (array_keys(default_payment_gateways()) as $gid) {
                if (!isset($data['gateways'][$gid]) || !is_array($data['gateways'][$gid])) {
                    continue;
                }

                $g = $data['gateways'][$gid];
                $gateways[$gid]['enabled'] = !empty($g['enabled']);
                $gateways[$gid]['checkoutUrl'] = trim((string) ($g['checkoutUrl'] ?? ''));
            }
        }

        $gatewaysJson = encode_payment_gateways($gateways);

        $stmt = $pdo->prepare('UPDATE site_payment_settings SET pix_copy_paste = ?, instructions_public = ?, webhook_enabled = ?, webhook_secret = ?, gateways_json = ? WHERE id = 1');
        $stmt->execute([$pix, $instr, $webhookEnabled, $secret, $gatewaysJson]);

        $secretWasSet = trim((string) ($row['webhook_secret'] ?? '')) !== '';
        $secretNowSet = $secret !== '';
        admin_audit_write($pdo, $adminActor, 'payment_settings.update', 'site_payment_settings', '1', 'Atualizou PIX, instruções públicas, webhook e gateways de checkout.', [
            'pixChars' => mb_strlen($pix),
            'instructionsChars' => mb_strlen($instr),
            'webhookEnabled' => (bool) $webhookEnabled,
            'webhookSecretWasSet' => $secretWasSet,
            'webhookSecretNowSet' => $secretNowSet,
            'webhookSecretCleared' => !empty($data['clearWebhookSecret']),
            'gatewaysSnapshot' => array_map(static function ($g) {
                return ['enabled' => !empty($g['enabled']), 'checkoutUrlChars' => mb_strlen((string) ($g['checkoutUrl'] ?? ''))];
            }, $gateways),
        ]);

        json_response(['settings' => map_payment_settings_admin(payment_settings_row($pdo))]);
    }

    if (preg_match('#^/admin/invoices/([^/]+)/status$#', $path, $match) && $method === 'PATCH') {
        $adminActor = require_admin_user($userId);
        $data = input_json();
        $status = in_array(($data['status'] ?? ''), ['pending', 'paid', 'cancelled'], true) ? $data['status'] : 'pending';

        $pdo = db();
        $stmt = $pdo->prepare('SELECT * FROM purchase_invoices WHERE id = ?');
        $stmt->execute([$match[1]]);
        $invBefore = $stmt->fetch();
        if (!$invBefore) {
            json_response(['message' => 'Fatura não encontrada.'], 404);
        }
        $prevStatus = (string) ($invBefore['status'] ?? '');

        if ($status === 'paid') {
            $stmt = $pdo->prepare("UPDATE purchase_invoices SET status = 'paid', paid_at = NOW() WHERE id = ?");
            $stmt->execute([$match[1]]);
        } elseif ($status === 'pending') {
            $stmt = $pdo->prepare("UPDATE purchase_invoices SET status = 'pending', paid_at = NULL WHERE id = ?");
            $stmt->execute([$match[1]]);
        } else {
            $stmt = $pdo->prepare("UPDATE purchase_invoices SET status = 'cancelled' WHERE id = ?");
            $stmt->execute([$match[1]]);
        }

        $stmt = $pdo->prepare('SELECT * FROM purchase_invoices WHERE id = ?');
        $stmt->execute([$match[1]]);
        $inv = $stmt->fetch();

        if ($status === 'paid') {
            apply_invoice_paid_side_effects($pdo, $inv);
        }

        admin_audit_write($pdo, $adminActor, 'invoice.status', 'purchase_invoice', $match[1], sprintf(
            'Fatura «%s» (%s): estado «%s» → «%s».',
            mb_substr((string) ($inv['plan_name'] ?? ''), 0, 40),
            mb_substr((string) ($inv['id'] ?? ''), 0, 10),
            $prevStatus,
            $status
        ), [
            'previousStatus' => $prevStatus,
            'newStatus' => $status,
            'planName' => $inv['plan_name'] ?? '',
            'customerEmail' => $inv['customer_email'] ?? '',
            'planPrice' => isset($inv['plan_price']) ? (float) $inv['plan_price'] : null,
        ]);

        json_response(['invoice' => map_purchase_invoice($inv)]);
    }
    if (preg_match('#^/admin/users/([^/]+)$#', $path, $match) && $method === 'PATCH') {
        $adminActor = require_admin_user($userId);
        $targetId = $match[1];
        $stmt = db()->prepare('SELECT id, name, email, role, plan FROM users WHERE id = ?');
        $stmt->execute([$targetId]);
        $beforeRow = $stmt->fetch();
        if (!$beforeRow) {
            json_response(['message' => 'Usuário não encontrado.'], 404);
        }

        $data = input_json();
        $role = ($data['role'] ?? 'user') === 'admin' ? 'admin' : 'user';
        $plan = trim((string) ($data['plan'] ?? 'Sem Plano')) ?: 'Sem Plano';

        $stmt = db()->prepare('UPDATE users SET role = ?, plan = ? WHERE id = ?');
        $stmt->execute([$role, $plan, $targetId]);

        admin_audit_write(db(), $adminActor, 'user.update', 'user', $targetId, sprintf(
            'Cliente «%s» (%s): papel %s→%s, plano «%s»→«%s».',
            $beforeRow['name'],
            $beforeRow['email'],
            $beforeRow['role'],
            $role,
            $beforeRow['plan'],
            $plan
        ), [
            'before' => ['role' => $beforeRow['role'], 'plan' => $beforeRow['plan']],
            'after' => ['role' => $role, 'plan' => $plan],
        ]);

        $stmt = db()->prepare('SELECT * FROM users WHERE id = ?');
        $stmt->execute([$targetId]);
        json_response(['user' => user_payload($stmt->fetch())]);
    }

    if (preg_match('#^/admin/users/([^/]+)$#', $path, $match) && $method === 'DELETE') {
        $adminActor = require_admin_user($userId);
        $targetUserId = $match[1];

        if ($targetUserId === $userId) {
            json_response(['message' => 'Você não pode excluir o próprio usuário administrador.'], 400);
        }

        $stmt = db()->prepare('SELECT id, name, email, role, plan FROM users WHERE id = ?');
        $stmt->execute([$targetUserId]);
        $delRow = $stmt->fetch();
        if (!$delRow) {
            json_response(['message' => 'Usuário não encontrado.'], 404);
        }

        $stmt = db()->prepare('DELETE FROM users WHERE id = ?');
        $stmt->execute([$targetUserId]);

        admin_audit_write(db(), $adminActor, 'user.delete', 'user', $targetUserId, sprintf(
            'Removeu o cliente «%s» (%s), plano «%s», papel %s.',
            $delRow['name'],
            $delRow['email'],
            $delRow['plan'],
            $delRow['role']
        ), [
            'deletedUser' => [
                'name' => $delRow['name'],
                'email' => $delRow['email'],
                'role' => $delRow['role'],
                'plan' => $delRow['plan'],
            ],
        ]);

        http_response_code(204);
        exit;
    }

    if ($path === '/admin/plan-permissions' && $method === 'GET') {
        require_admin_user($userId);
        $profiles = [];
        foreach (canonical_assignment_plans() as $planKey) {
            $profiles[] = [
                'planKey' => $planKey,
                'permissions' => fetch_effective_permissions($planKey),
            ];
        }

        json_response(['profiles' => $profiles]);
    }

    if ($path === '/admin/plan-permissions' && $method === 'PATCH') {
        $adminActor = require_admin_user($userId);
        $data = input_json();
        $planKey = trim((string) ($data['planKey'] ?? ''));
        if (!in_array($planKey, canonical_assignment_plans(), true)) {
            json_response(['message' => 'Perfil de plano inválido.'], 400);
        }

        $incoming = $data['permissions'] ?? null;
        if (!is_array($incoming)) {
            json_response(['message' => 'Informe o objeto permissions.'], 400);
        }

        $beforePerms = fetch_effective_permissions($planKey);
        $normalized = normalize_permissions_from_request($planKey, $incoming);
        $pdo = db();
        $stmt = $pdo->prepare(
            'INSERT INTO plan_permission_profiles (plan_key, permissions_json) VALUES (?, ?)
             ON DUPLICATE KEY UPDATE permissions_json = VALUES(permissions_json)'
        );
        $stmt->execute([$planKey, json_encode($normalized, JSON_UNESCAPED_UNICODE)]);

        admin_audit_write($pdo, $adminActor, 'plan_permissions.update', 'plan_permission_profile', $planKey, sprintf(
            'Matriz de permissões do perfil «%s» atualizada no painel ADM.',
            $planKey
        ), [
            'before' => $beforePerms,
            'after' => $normalized,
        ]);

        json_response(['planKey' => $planKey, 'permissions' => $normalized]);
    }

    if ($path === '/admin/audit-log' && $method === 'GET') {
        require_admin_user($userId);
        $limit = min(200, max(1, (int) ($_GET['limit'] ?? 50)));
        $offset = max(0, (int) ($_GET['offset'] ?? 0));
        $pdo = db();
        $stmt = $pdo->prepare('SELECT * FROM admin_audit_log ORDER BY created_at DESC LIMIT ' . $limit . ' OFFSET ' . $offset);
        $stmt->execute();
        $rows = $stmt->fetchAll();
        $total = (int) ($pdo->query('SELECT COUNT(*) AS c FROM admin_audit_log')->fetch()['c'] ?? 0);

        json_response([
            'entries' => array_map('map_audit_entry', $rows),
            'total' => $total,
            'limit' => $limit,
            'offset' => $offset,
        ]);
    }

    if ($path === '/transactions') {
        $authRow = auth_user_row($userId);

        if ($method === 'GET') {
            if (!user_has_permission($authRow, 'panelTransactions')) {
                json_response(['transactions' => []]);
            }

            $stmt = db()->prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY transaction_date DESC, created_at DESC');
            $stmt->execute([$userId]);
            json_response(['transactions' => array_map('map_transaction', $stmt->fetchAll())]);
        }

        if ($method === 'POST') {
            assert_user_permission_row($authRow, 'panelTransactions');
            $data = input_json();
            $id = bin2hex(random_bytes(16));
            $stmt = db()->prepare('INSERT INTO transactions (id, user_id, type, description, amount, category, transaction_date, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
            $stmt->execute([$id, $userId, $data['type'], $data['description'], $data['amount'], $data['category'], $data['date'], $data['paymentStatus'] ?? 'paid']);
            $stmt = db()->prepare('SELECT * FROM transactions WHERE id = ?');
            $stmt->execute([$id]);
            json_response(['transaction' => map_transaction($stmt->fetch())], 201);
        }
    }

    if (preg_match('#^/transactions/([^/]+)$#', $path, $match) && $method === 'DELETE') {
        assert_user_permission($userId, 'panelTransactions');
        $stmt = db()->prepare('DELETE FROM transactions WHERE id = ? AND user_id = ?');
        $stmt->execute([$match[1], $userId]);
        http_response_code(204);
        exit;
    }

    if (preg_match('#^/transactions/([^/]+)/status$#', $path, $match) && $method === 'PATCH') {
        assert_user_permission($userId, 'panelTransactions');
        $data = input_json();
        $stmt = db()->prepare('UPDATE transactions SET payment_status = ? WHERE id = ? AND user_id = ?');
        $stmt->execute([$data['status'], $match[1], $userId]);
        $stmt = db()->prepare('SELECT * FROM transactions WHERE id = ? AND user_id = ?');
        $stmt->execute([$match[1], $userId]);
        json_response(['transaction' => map_transaction($stmt->fetch())]);
    }

    if ($path === '/goals') {
        $authRow = auth_user_row($userId);

        if ($method === 'GET') {
            if (!user_has_permission($authRow, 'panelGoals')) {
                json_response(['goals' => []]);
            }

            $stmt = db()->prepare('SELECT * FROM financial_goals WHERE user_id = ? ORDER BY deadline ASC');
            $stmt->execute([$userId]);
            json_response(['goals' => array_map('map_goal', $stmt->fetchAll())]);
        }

        if ($method === 'POST') {
            assert_user_permission_row($authRow, 'panelGoals');
            $data = input_json();
            $id = bin2hex(random_bytes(16));
            $stmt = db()->prepare('INSERT INTO financial_goals (id, user_id, title, target_amount, current_amount, deadline) VALUES (?, ?, ?, ?, ?, ?)');
            $stmt->execute([$id, $userId, $data['title'], $data['targetAmount'], $data['currentAmount'] ?? 0, $data['deadline']]);
            $stmt = db()->prepare('SELECT * FROM financial_goals WHERE id = ?');
            $stmt->execute([$id]);
            json_response(['goal' => map_goal($stmt->fetch())], 201);
        }
    }

    if (preg_match('#^/goals/([^/]+)/progress$#', $path, $match) && $method === 'PATCH') {
        assert_user_permission($userId, 'panelGoals');
        $data = input_json();
        $stmt = db()->prepare('UPDATE financial_goals SET current_amount = ? WHERE id = ? AND user_id = ?');
        $stmt->execute([$data['currentAmount'], $match[1], $userId]);
        $stmt = db()->prepare('SELECT * FROM financial_goals WHERE id = ? AND user_id = ?');
        $stmt->execute([$match[1], $userId]);
        json_response(['goal' => map_goal($stmt->fetch())]);
    }

    if (preg_match('#^/goals/([^/]+)$#', $path, $match) && $method === 'DELETE') {
        assert_user_permission($userId, 'panelGoals');
        $stmt = db()->prepare('DELETE FROM financial_goals WHERE id = ? AND user_id = ?');
        $stmt->execute([$match[1], $userId]);
        http_response_code(204);
        exit;
    }

    if ($path === '/budgets') {
        $authRow = auth_user_row($userId);

        if ($method === 'GET') {
            if (!user_has_permission($authRow, 'categoryBudget')) {
                json_response(['budgets' => []]);
            }

            $stmt = db()->prepare('SELECT * FROM category_budgets WHERE user_id = ? ORDER BY category ASC');
            $stmt->execute([$userId]);
            json_response(['budgets' => array_map('map_budget', $stmt->fetchAll())]);
        }

        if ($method === 'POST') {
            assert_user_permission_row($authRow, 'categoryBudget');
            $data = input_json();
            $id = bin2hex(random_bytes(16));
            $stmt = db()->prepare('INSERT INTO category_budgets (id, user_id, category, monthly_limit, alert_percentage) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE monthly_limit = VALUES(monthly_limit), alert_percentage = VALUES(alert_percentage)');
            $stmt->execute([$id, $userId, $data['category'], $data['monthlyLimit'], $data['alertPercentage'] ?? 80]);
            $stmt = db()->prepare('SELECT * FROM category_budgets WHERE user_id = ? AND category = ?');
            $stmt->execute([$userId, $data['category']]);
            json_response(['budget' => map_budget($stmt->fetch())], 201);
        }
    }

    if (preg_match('#^/budgets/([^/]+)$#', $path, $match) && $method === 'DELETE') {
        assert_user_permission($userId, 'categoryBudget');
        $stmt = db()->prepare('DELETE FROM category_budgets WHERE id = ? AND user_id = ?');
        $stmt->execute([$match[1], $userId]);
        http_response_code(204);
        exit;
    }

    if ($path === '/recurring-transactions') {
        $authRow = auth_user_row($userId);

        if ($method === 'GET') {
            if (!user_has_permission($authRow, 'professionalAutomation')) {
                json_response(['recurringTransactions' => []]);
            }

            $stmt = db()->prepare('SELECT * FROM recurring_transactions WHERE user_id = ? ORDER BY day_of_month ASC');
            $stmt->execute([$userId]);
            json_response(['recurringTransactions' => array_map('map_recurring', $stmt->fetchAll())]);
        }

        if ($method === 'POST') {
            assert_user_permission_row($authRow, 'professionalAutomation');
            $data = input_json();
            $id = bin2hex(random_bytes(16));
            $stmt = db()->prepare('INSERT INTO recurring_transactions (id, user_id, description, type, amount, category, day_of_month, payment_status, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
            $stmt->execute([$id, $userId, $data['description'], $data['type'], $data['amount'], $data['category'], $data['dayOfMonth'], $data['paymentStatus'] ?? 'pending', $data['active'] ?? true]);
            $stmt = db()->prepare('SELECT * FROM recurring_transactions WHERE id = ?');
            $stmt->execute([$id]);
            json_response(['recurringTransaction' => map_recurring($stmt->fetch())], 201);
        }
    }

    if (preg_match('#^/recurring-transactions/([^/]+)$#', $path, $match) && $method === 'DELETE') {
        assert_user_permission($userId, 'professionalAutomation');
        $stmt = db()->prepare('DELETE FROM recurring_transactions WHERE id = ? AND user_id = ?');
        $stmt->execute([$match[1], $userId]);
        http_response_code(204);
        exit;
    }

    if ($path === '/credit-cards') {
        $authRow = auth_user_row($userId);

        if ($method === 'GET') {
            if (!user_has_permission($authRow, 'professionalAutomation')) {
                json_response(['creditCards' => []]);
            }

            $stmt = db()->prepare('SELECT * FROM credit_cards WHERE user_id = ? ORDER BY created_at DESC');
            $stmt->execute([$userId]);
            json_response(['creditCards' => array_map('map_card', $stmt->fetchAll())]);
        }

        if ($method === 'POST') {
            assert_user_permission_row($authRow, 'professionalAutomation');
            $data = input_json();
            $id = bin2hex(random_bytes(16));
            $stmt = db()->prepare('INSERT INTO credit_cards (id, user_id, name, card_limit, closing_day, due_day, current_invoice) VALUES (?, ?, ?, ?, ?, ?, ?)');
            $stmt->execute([$id, $userId, $data['name'], $data['limit'], $data['closingDay'], $data['dueDay'], $data['currentInvoice'] ?? 0]);
            $stmt = db()->prepare('SELECT * FROM credit_cards WHERE id = ?');
            $stmt->execute([$id]);
            json_response(['creditCard' => map_card($stmt->fetch())], 201);
        }
    }

    if (preg_match('#^/credit-cards/([^/]+)$#', $path, $match) && $method === 'DELETE') {
        assert_user_permission($userId, 'professionalAutomation');
        $stmt = db()->prepare('DELETE FROM credit_cards WHERE id = ? AND user_id = ?');
        $stmt->execute([$match[1], $userId]);
        http_response_code(204);
        exit;
    }

    if ($path === '/shared-accesses') {
        $authRow = auth_user_row($userId);

        if ($method === 'GET') {
            if (!user_has_permission($authRow, 'multiUser')) {
                json_response(['sharedAccesses' => []]);
            }

            $stmt = db()->prepare('SELECT * FROM shared_accesses WHERE user_id = ? ORDER BY created_at DESC');
            $stmt->execute([$userId]);
            json_response(['sharedAccesses' => array_map('map_access', $stmt->fetchAll())]);
        }

        if ($method === 'POST') {
            assert_user_permission_row($authRow, 'multiUser');
            $data = input_json();
            $id = bin2hex(random_bytes(16));
            $stmt = db()->prepare('INSERT INTO shared_accesses (id, user_id, name, email, role, permission) VALUES (?, ?, ?, ?, ?, ?)');
            $stmt->execute([$id, $userId, $data['name'], $data['email'], $data['role'] ?? 'Colaborador', $data['permission'] ?? 'Visualização']);
            $stmt = db()->prepare('SELECT * FROM shared_accesses WHERE id = ?');
            $stmt->execute([$id]);
            json_response(['sharedAccess' => map_access($stmt->fetch())], 201);
        }
    }

    if (preg_match('#^/shared-accesses/([^/]+)$#', $path, $match) && $method === 'DELETE') {
        assert_user_permission($userId, 'multiUser');
        $stmt = db()->prepare('DELETE FROM shared_accesses WHERE id = ? AND user_id = ?');
        $stmt->execute([$match[1], $userId]);
        http_response_code(204);
        exit;
    }

    if ($path === '/receipts' && $method === 'POST') {
        assert_user_permission($userId, 'panelReceipts');
        $id = bin2hex(random_bytes(16));
        $imagePath = null;

        if (!empty($_FILES['image']['tmp_name'])) {
            $uploadDir = __DIR__ . '/uploads/receipts';
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
            $extension = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
            $fileName = $id . ($extension ? ".$extension" : '');
            move_uploaded_file($_FILES['image']['tmp_name'], "$uploadDir/$fileName");
            $imagePath = "api/uploads/receipts/$fileName";
        }

        $items = json_decode($_POST['items'] ?? '[]', true);
        $pdo = db();
        $pdo->beginTransaction();
        $stmt = $pdo->prepare('INSERT INTO receipts (id, user_id, company_name, cnpj, purchase_date, total_amount, image_path, ocr_text) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute([$id, $userId, $_POST['companyName'] ?? null, $_POST['cnpj'] ?? null, $_POST['purchaseDate'] ?? null, $_POST['totalAmount'] ?? null, $imagePath, $_POST['ocrText'] ?? null]);

        if (is_array($items)) {
            $stmt = $pdo->prepare('INSERT INTO receipt_items (id, receipt_id, description, quantity, unit_price, total) VALUES (?, ?, ?, ?, ?, ?)');
            foreach ($items as $item) {
                $stmt->execute([bin2hex(random_bytes(16)), $id, $item['description'] ?? 'Item sem descrição', $item['quantity'] ?? 1, $item['unitPrice'] ?: null, $item['total'] ?: null]);
            }
        }

        $pdo->commit();
        json_response(['id' => $id], 201);
    }

    json_response(['message' => 'Rota não encontrada.', 'path' => $path], 404);
} catch (Throwable $error) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    json_response([
        'message' => 'Erro na API.',
        'detail' => $error->getMessage(),
    ], 500);
}
