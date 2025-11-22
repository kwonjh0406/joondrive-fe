# Joon Drive API 명세서

## 파일 이동 API

### 엔드포인트
```
PUT /api/files/move
```

### 설명
파일 또는 폴더를 다른 폴더로 이동시킵니다. 파일의 `parentId`를 변경하여 폴더 구조를 조정합니다.

### 요청

#### 헤더
```
Content-Type: application/json
Cookie: JSESSIONID=<session-id> (또는 remember-me=<token>)
```

#### 요청 본문 (JSON)
```json
{
  "fileId": 123,
  "newParentId": 456
}
```

**필드 설명:**
- `fileId` (number, required): 이동할 파일 또는 폴더의 ID
- `newParentId` (number | null, required): 새로운 부모 폴더의 ID. `null`인 경우 루트 폴더로 이동

#### 요청 예시
```json
{
  "fileId": 123,
  "newParentId": 456
}
```

루트 폴더로 이동하는 경우:
```json
{
  "fileId": 123,
  "newParentId": null
}
```

### 응답

#### 성공 응답 (200 OK)
```json
{
  "success": true,
  "message": "파일이 이동되었습니다.",
  "data": {
    "id": 123,
    "name": "example.txt",
    "parentId": 456,
    "fileType": "file",
    "size": 1024,
    "modified": "2024-01-15T10:30:00Z"
  }
}
```

#### 에러 응답

**400 Bad Request** - 잘못된 요청
```json
{
  "success": false,
  "message": "자기 자신의 폴더로는 이동할 수 없습니다.",
  "error": "INVALID_MOVE"
}
```

**404 Not Found** - 파일을 찾을 수 없음
```json
{
  "success": false,
  "message": "파일을 찾을 수 없습니다.",
  "error": "FILE_NOT_FOUND"
}
```

**404 Not Found** - 대상 폴더를 찾을 수 없음
```json
{
  "success": false,
  "message": "대상 폴더를 찾을 수 없습니다.",
  "error": "PARENT_NOT_FOUND"
}
```

**403 Forbidden** - 권한 없음
```json
{
  "success": false,
  "message": "파일을 이동할 권한이 없습니다.",
  "error": "FORBIDDEN"
}
```

**409 Conflict** - 순환 참조 방지
```json
{
  "success": false,
  "message": "폴더를 자기 자신이나 하위 폴더로 이동할 수 없습니다.",
  "error": "CIRCULAR_REFERENCE"
}
```

**401 Unauthorized** - 인증 실패
```json
{
  "success": false,
  "message": "인증이 필요합니다.",
  "error": "UNAUTHORIZED"
}
```

### 비즈니스 로직

1. **파일 존재 확인**: `fileId`에 해당하는 파일/폴더가 존재하는지 확인
2. **대상 폴더 확인**: `newParentId`가 `null`이 아닌 경우, 해당 폴더가 존재하는지 확인
3. **권한 확인**: 사용자가 해당 파일을 이동할 권한이 있는지 확인
4. **순환 참조 방지**: 폴더를 자기 자신이나 하위 폴더로 이동하는 것을 방지
5. **중복 확인**: 이미 해당 폴더에 있는 경우 경고 메시지 반환 (선택사항)
6. **이동 실행**: 파일의 `parentId`를 `newParentId`로 업데이트

### 구현 예시 (Spring Boot)

```java
@PutMapping("/move")
public ResponseEntity<ApiResponse<FileResponse>> moveFile(
    @RequestBody MoveFileRequest request,
    HttpServletRequest httpRequest
) {
    // 1. 인증 확인
    User user = getCurrentUser(httpRequest);
    if (user == null) {
        return ResponseEntity.status(401)
            .body(ApiResponse.error("인증이 필요합니다."));
    }

    // 2. 파일 존재 확인
    FileEntity file = fileRepository.findById(request.getFileId())
        .orElseThrow(() -> new FileNotFoundException("파일을 찾을 수 없습니다."));

    // 3. 권한 확인
    if (!file.getOwner().getId().equals(user.getId())) {
        return ResponseEntity.status(403)
            .body(ApiResponse.error("파일을 이동할 권한이 없습니다."));
    }

    // 4. 대상 폴더 확인
    if (request.getNewParentId() != null) {
        FileEntity parentFolder = fileRepository.findById(request.getNewParentId())
            .orElseThrow(() -> new FileNotFoundException("대상 폴더를 찾을 수 없습니다."));
        
        if (!parentFolder.getFileType().equals("folder")) {
            return ResponseEntity.status(400)
                .body(ApiResponse.error("대상이 폴더가 아닙니다."));
        }

        // 5. 순환 참조 방지
        if (file.getFileType().equals("folder")) {
            if (isDescendant(parentFolder, file)) {
                return ResponseEntity.status(409)
                    .body(ApiResponse.error("폴더를 자기 자신이나 하위 폴더로 이동할 수 없습니다."));
            }
        }

        // 6. 자기 자신으로 이동 방지
        if (file.getId().equals(request.getNewParentId())) {
            return ResponseEntity.status(400)
                .body(ApiResponse.error("자기 자신의 폴더로는 이동할 수 없습니다."));
        }
    }

    // 7. 이미 같은 폴더에 있는지 확인 (선택사항)
    if (Objects.equals(file.getParentId(), request.getNewParentId())) {
        return ResponseEntity.status(200)
            .body(ApiResponse.success("이미 해당 폴더에 있습니다.", 
                FileResponse.from(file)));
    }

    // 8. 이동 실행
    file.setParentId(request.getNewParentId());
    file.setModified(LocalDateTime.now());
    fileRepository.save(file);

    return ResponseEntity.ok(
        ApiResponse.success("파일이 이동되었습니다.", FileResponse.from(file))
    );
}

private boolean isDescendant(FileEntity ancestor, FileEntity descendant) {
    FileEntity current = descendant;
    while (current.getParentId() != null) {
        if (current.getParentId().equals(ancestor.getId())) {
            return true;
        }
        current = fileRepository.findById(current.getParentId())
            .orElse(null);
        if (current == null) break;
    }
    return false;
}
```

### 요청/응답 DTO 예시

```java
// 요청 DTO
public class MoveFileRequest {
    @NotNull
    private Long fileId;
    
    private Long newParentId; // null 가능
    
    // getters, setters
}

// 응답 DTO
public class FileResponse {
    private Long id;
    private String name;
    private String fileType;
    private Long parentId;
    private Long size;
    private LocalDateTime modified;
    
    // getters, setters, from() 메서드
}
```

### 주의사항

1. **순환 참조 방지**: 폴더를 자기 자신이나 하위 폴더로 이동하는 것을 반드시 방지해야 합니다.
2. **권한 확인**: 사용자가 해당 파일을 이동할 권한이 있는지 확인해야 합니다.
3. **트랜잭션**: 파일 이동은 원자적으로 처리되어야 합니다.
4. **수정 시간 업데이트**: 파일 이동 시 `modified` 필드를 현재 시간으로 업데이트해야 합니다.

