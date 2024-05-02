import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('http://43.200.85.230:8080/api/member/detail', async () => {
    return HttpResponse.json({
      memberId: 1,
      email: 'example1@example.com',
      nickName: '78cf1feb-eac3-4bfa-8e7a-fefda2300a40',
      birthDate: '1990-01-01',
      gender: 'MALE',
      phoneNumber: null,
      profileImg: null,
      signupPath: 'NORMAL',
      signupDttm: '2024-04-30T22:57:59.187977',
      membership: 'FREE',
    });
  }),
];
