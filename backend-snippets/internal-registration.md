# Backend (Laravel) for /internal-registration — standalone, no links to existing tables

routes/api.php (inside the v1 group), throttled:
```php
Route::prefix('internal-registration')->middleware('throttle:10,1')->group(function () {
    Route::post('otp',    [InternalRegistrationController::class, 'otp']);
    Route::post('verify', [InternalRegistrationController::class, 'verify']);
    Route::post('submit', [InternalRegistrationController::class, 'submit']);
});
```
Migration:
```php
Schema::create('internal_registrations', function (Blueprint $t) {
    $t->id(); $t->string('name'); $t->string('class'); $t->string('mobile')->unique();
    $t->timestamps();
});
```
Controller (OTP kept in cache, 5 min; replace `sendSms()` with your SMS gateway, e.g. Notify.lk / Dialog):
```php
public function otp(Request $r) {
    $m = $r->validate(['mobile' => 'required|string|min:9|max:16'])['mobile'];
    $code = random_int(100000, 999999);
    Cache::put("reg_otp:$m", Hash::make($code), 300);
    $this->sendSms($m, "Your verification code is $code");
    return ['ok' => true];
}
public function verify(Request $r) {
    $d = $r->validate(['mobile' => 'required', 'code' => 'required|digits:6']);
    $hash = Cache::get("reg_otp:{$d['mobile']}");
    if (!$hash || !Hash::check($d['code'], $hash)) return response()->json(['message' => 'Invalid or expired code'], 422);
    Cache::forget("reg_otp:{$d['mobile']}");
    $token = Str::random(40);
    Cache::put("reg_ok:$token", $d['mobile'], 900);
    return ['token' => $token];
}
public function submit(Request $r) {
    $d = $r->validate(['name' => 'required|string|max:120', 'class' => 'required|string|max:120', 'mobile' => 'required', 'token' => 'required']);
    if (Cache::pull("reg_ok:{$d['token']}") !== $d['mobile']) return response()->json(['message' => 'Mobile not verified'], 422);
    InternalRegistration::updateOrCreate(['mobile' => $d['mobile']], ['name' => $d['name'], 'class' => $d['class']]);
    return ['ok' => true];
}
```
