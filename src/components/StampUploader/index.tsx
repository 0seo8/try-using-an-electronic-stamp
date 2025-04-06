import { useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useStore, Stamp } from '@/store';
import { useFileValidation } from '@/hooks/useFileValidation';
import { stampFileSchema } from '@/utils/validations';
import { toast } from 'sonner';
import * as S from './styles';

const StampUploader = () => {
  const { stamps, addStamp, removeStamp, selectedStamp, selectStamp, file } = useStore();
  const stampInputRef = useRef<HTMLInputElement>(null);

  // 도장 이미지 유효성 검사 훅
  const { isLoading: isStampLoading, validateFile: validateStampFile } =
    useFileValidation(stampFileSchema);

  const handleStampChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;

    if (selectedFile) {
      // 최대 5개 제한 확인
      if (stamps.length >= 5) {
        toast.error('도장은 최대 5개까지만 업로드할 수 있습니다.');
        e.target.value = '';
        return;
      }

      // 파일 유효성 검사 수행
      const isValid = validateStampFile(selectedFile);

      // 유효한 파일이면 상태 업데이트
      if (isValid) {
        try {
          // 파일을 Base64로 변환
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              const newStamp: Stamp = {
                id: uuidv4(),
                src: event.target.result as string,
                name: selectedFile.name,
              };

              addStamp(newStamp);
              toast.success('도장 이미지가 추가되었습니다.');
            }
          };
          reader.readAsDataURL(selectedFile);
        } catch (error) {
          console.error('도장 이미지 변환 중 오류:', error);
          toast.error('도장 이미지 변환 중 오류가 발생했습니다.');
        }
      }
    }

    // 입력 필드 초기화
    e.target.value = '';
  };

  const handleStampUpload = () => {
    stampInputRef.current?.click();
  };

  const handleStampRemove = (stampId: string) => {
    removeStamp(stampId);
    toast.info('도장 이미지가 삭제되었습니다.');
  };

  const handleStampSelect = (stamp: Stamp) => {
    // 이미 선택된 도장을 다시 클릭하면 선택 해제
    if (selectedStamp?.id === stamp.id) {
      selectStamp(null);
    } else {
      selectStamp(stamp);
      toast.info(`도장 "${stamp.name}"이(가) 선택되었습니다.`);
    }
  };

  const handleStampDraw = () => {
    if (!file) {
      toast.error('PDF 파일을 먼저 업로드해주세요.');
      return;
    }

    if (!selectedStamp) {
      toast.error('도장을 먼저 선택해주세요.');
      return;
    }

    // 도장 찍기 기능 구현 예정
    toast.info('도장 찍기는 아직 구현되지 않았습니다.');
  };

  return (
    <S.Container>
      <S.ContentArea>
        <div>
          <input
            ref={stampInputRef}
            type="file"
            accept=".png"
            onChange={handleStampChange}
            style={{ display: 'none' }}
          />
          <S.UploadButton
            type="button"
            onClick={handleStampUpload}
            disabled={isStampLoading || stamps.length >= 5}
          >
            {isStampLoading ? '로딩 중...' : '도장 업로드'}
          </S.UploadButton>

          {stamps.length >= 5 && (
            <S.LimitMessage>도장은 최대 5개까지만 업로드할 수 있습니다.</S.LimitMessage>
          )}
        </div>

        {stamps.length > 0 ? (
          <S.StampsContainer>
            {stamps.map((stamp) => (
              <S.StampItem
                key={stamp.id}
                className={selectedStamp?.id === stamp.id ? 'selected' : ''}
              >
                <S.StampImage
                  src={stamp.src}
                  alt={stamp.name}
                  onClick={() => handleStampSelect(stamp)}
                />
                <S.RemoveButton type="button" onClick={() => handleStampRemove(stamp.id)}>
                  ×
                </S.RemoveButton>
              </S.StampItem>
            ))}
          </S.StampsContainer>
        ) : (
          <S.EmptyMessage>업로드된 도장이 없습니다.</S.EmptyMessage>
        )}
      </S.ContentArea>

      <S.ApplyStampButton
        type="button"
        onClick={handleStampDraw}
        disabled={!file || !selectedStamp}
      >
        도장 찍기
      </S.ApplyStampButton>
    </S.Container>
  );
};

export default StampUploader;
