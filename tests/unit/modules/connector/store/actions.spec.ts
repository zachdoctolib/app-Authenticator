/*
 * Copyright 2023 gematik GmbH
 *
 * The Authenticator App is licensed under the European Union Public Licence (EUPL); every use of the Authenticator App
 * Sourcecode must be in compliance with the EUPL.
 *
 * You will find more details about the EUPL here: https://joinup.ec.europa.eu/collection/eupl
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the EUPL is distributed on an "AS
 * IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the EUPL for the specific
 * language governing permissions and limitations under the License.ee the Licence for the specific language governing
 * permissions and limitations under the Licence.
 */

import store from '@/renderer/store';
import { ECardTypes } from '@/renderer/modules/connector/ECardTypes';
import base64url from 'base64url';
import { TPinStatusResponse } from '@/renderer/modules/connector/type-definitions';
import { GemIdpJwsOptions } from '@/renderer/modules/gem-idp/sign-feature/cidp-sign-options';
import { OgrJwsOptions } from '@/renderer/modules/auth-service/sign-feature';

const CERT_MOCKS = {
  HbaCardHandle:
    'MIIEmTCCA4GgAwIBAgIEGzj0kDANBgkqhkiG9w0BAQsFADCBhzEjMCEGA1UEAwwaQy5FSEVYLkhVTUFOLUNBMSBURVNULU9OTFkxNTAzBgNVBAsMLGVIZWFsdGhFeHBlcnRzLUNBIGRlciBUZWxlbWF0aWtpbmZyYXN0cnVrdHVyMRwwGgYDVQQKDBNlSGVhbHRoRXhwZXJ0cyBHbWJIMQswCQYDVQQGEwJERTAeFw0yMTA3MDkxNDU0MzRaFw00ODEyMzAyMzAwMDBaMF0xGjAYBgNVBAMMEURyLiBQZXRlciBNw7xsbGVyMRQwEgYDVQQFEwsxLWhiYS12YWxpZDEcMBoGA1UECgwTZUhlYWx0aEV4cGVydHMgR21iSDELMAkGA1UEBhMCREUwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCpCmOCqtmVkQmZ8vvJa+u//rZ67gCacYwzw8zyDZe2Aul7S6+F/5z1YQJv+wODoSMN2Q/NLp9sRtc09LJP0paGDcuxOQh68G18k0BbILPymOmL+qrRh4cyYMWYAsYedXRKjQATV43rnzj8m4n4aX07jiwT1jjGbJu/mdGLx2qnFkjCHvmfgerWoZ1N6ZiAULVZtjwkUOMuydiGhiSVg5kjrt++IGWdzw/nVg4Qep4SOPb+bZBCGix9tsmhsNaloJzrbwgUnJJHCqvGnE/9P6fwpbkWen/yk/W7dhR7Tnb6t6QCqbCqokL7SlxUdl7G5avkMuXVLxcQJfX3TTu7gb8LAgMBAAGjggE0MIIBMDAfBgNVHSMEGDAWgBTj2V4LuxVVaSSLtpa7b8xB3Qd6XzAdBgNVHQ4EFgQUDUsbRMq2lGHsZd/2qY8kRrzcX3IwDAYDVR0TAQH/BAIwADAOBgNVHQ8BAf8EBAMCBaAwHQYDVR0lBBYwFAYIKwYBBQUHAwIGCCsGAQUFBwMEMCAGA1UdIAQZMBcwCgYIKoIUAEwEgREwCQYHKoIUAEwESzBSBggrBgEFBQcBAQRGMEQwQgYIKwYBBQUHMAGGNmh0dHA6Ly9vY3NwLmVoZXguZGU6MjU2MC9lamJjYS9wcml2YXRlL3dlYi9zdGF0dXMvb2NzcDA7BgUrJAgDAwQyMDAwLjAsMCowKDAODAzDhHJ6dGluL0FyenQwCQYHKoIUAEwEHhMLMS1oYmEtdmFsaWQwDQYJKoZIhvcNAQELBQADggEBABK0fMCogQsbnKFkrZYl8NF8jxM2TsBqMmn0DV28LfKo9ZZDn3bc+z+TFJ2LnynsddaS+R8bV8U5JXhvvr8uLDZgoyej/wXZh1znqXNCBPzz0vAkdC0yuQUfDn2U9A2IYULPcauII1hPx4A2nxoDtjAfuPq5j7JxfJjbV5wcBLcYCoiU9q7QBc3PiQz4wmRurXFl3rZyZVb9AnWSAUkG8Do1kydhNsDTpmWQtYx4y03QrPKPEk6dbdTAgD5VnhU3/zSwCiM9PpO+MOMchuM7NDqoRGlTONszZxxiaqzqQ5d0dSY+48asm7xAVpR2mg031UjLFRV0qkVjHLJlv0dfCUk=',
  SmcbCardHandle:
    'MIIEpzCCA4+gAwIBAgIEXEou7TANBgkqhkiG9w0BAQsFADCBhzEjMCEGA1UEAwwaQy5FSEVYLkhVTUFOLUNBMSBURVNULU9OTFkxNTAzBgNVBAsMLGVIZWFsdGhFeHBlcnRzLUNBIGRlciBUZWxlbWF0aWtpbmZyYXN0cnVrdHVyMRwwGgYDVQQKDBNlSGVhbHRoRXhwZXJ0cyBHbWJIMQswCQYDVQQGEwJERTAeFw0yMTA5MDkxMjI5MjlaFw00ODEyMzAyMzAwMDBaMGUxGjAYBgNVBAMMEVRlc3QgUHJheGlzIFZhbGlkMRwwGgYDVQQFExMxLXNtY2ItZG9jdG9yLXZhbGlkMRwwGgYDVQQKDBNlSGVhbHRoRXhwZXJ0cyBHbWJIMQswCQYDVQQGEwJERTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAKkKY4Kq2ZWRCZny+8lr67/+tnruAJpxjDPDzPINl7YC6XtLr4X/nPVhAm/7A4OhIw3ZD80un2xG1zT0sk/SloYNy7E5CHrwbXyTQFsgs/KY6Yv6qtGHhzJgxZgCxh51dEqNABNXjeufOPybifhpfTuOLBPWOMZsm7+Z0YvHaqcWSMIe+Z+B6tahnU3pmIBQtVm2PCRQ4y7J2IaGJJWDmSOu374gZZ3PD+dWDhB6nhI49v5tkEIaLH22yaGw1qWgnOtvCBSckkcKq8acT/0/p/CluRZ6f/KT9bt2FHtOdvq3pAKpsKqiQvtKXFR2Xsblq+Qy5dUvFxAl9fdNO7uBvwsCAwEAAaOCATowggE2MB8GA1UdIwQYMBaAFOPZXgu7FVVpJIu2lrtvzEHdB3pfMB0GA1UdDgQWBBQNSxtEyraUYexl3/apjyRGvNxfcjAMBgNVHRMBAf8EAjAAMA4GA1UdDwEB/wQEAwIFoDATBgNVHSUEDDAKBggrBgEFBQcDAjAgBgNVHSAEGTAXMAoGCCqCFABMBIEjMAkGByqCFABMBE0wUgYIKwYBBQUHAQEERjBEMEIGCCsGAQUFBzABhjZodHRwOi8vb2NzcC5laGV4LmRlOjI1NjAvZWpiY2EvcHJpdmF0ZS93ZWIvc3RhdHVzL29jc3AwSwYFKyQIAwMEQjBAMD4wPDA6MDgwFgwUQmV0cmllYnNzdMOkdHRlIEFyenQwCQYHKoIUAEwEMhMTMS1zbWNiLWRvY3Rvci12YWxpZDANBgkqhkiG9w0BAQsFAAOCAQEAJZnXcn7DDrEXd2IDhLWk/564gm7niJ5hKi4r3P+nMoXSIdaAi9x3x2CJ4lBfsoQ2M2JeHTCVEj+fpM96D2aB8rnHk6NkMK39+dXzuLIsfC8epXeLFmETVCI4rTJgsnJPKXGmpDUSmZ9qLEokTbPzWBbEpZ/7rPR4iO+UQXb0ZBtyF+V4LvBalsJoa5rFmLF+opETAbtCd0hlFfzv6952z9ifi5vcf1oNmLqXYqmHC0x7N7ENi29dwIvdMIlpKX0uSofwZ5QpLjzU7odVbbNPG5qmcOu2c30nrsvlZQyOHH5GoPiClL36YRfVq5vskaxfzRluzwCy10fPR3tPOY+/3w==',
};

const JWS_SIGNATUR_MOCKED =
  'eyJ4NWMiOlsiTUlJRldEQ0NCRUNnQXdJQkFnSUhBVjFPZ2FwMmhqQU5CZ2txaGtpRzl3MEJBUXNGQURDQm1qRUxNQWtHQTFVRUJoTUNSRVV4SHpBZEJnTlZCQW9NRm1kbGJXRjBhV3NnUjIxaVNDQk9UMVF0VmtGTVNVUXhTREJHQmdOVkJBc01QMGx1YzNScGRIVjBhVzl1SUdSbGN5QkhaWE4xYm1Sb1pXbDBjM2RsYzJWdWN5MURRU0JrWlhJZ1ZHVnNaVzFoZEdscmFXNW1jbUZ6ZEhKMWEzUjFjakVnTUI0R0ExVUVBd3dYUjBWTkxsTk5RMEl0UTBFeU5DQlVSVk5VTFU5T1RGa3dIaGNOTWpBd05qRXdNREF3TURBd1doY05NalV3TmpBNU1qTTFPVFU1V2pDQjN6RUxNQWtHQTFVRUJoTUNSRVV4RXpBUkJnTlZCQWNNQ2tkbGNuTjBhRzltWlc0eERqQU1CZ05WQkJFTUJUZzJNelk0TVJvd0dBWURWUVFKREJGUGRIUnZMVWhoYUc0dFUzUnlMaUE1T1RFcU1DZ0dBMVVFQ2d3aE15MVRUVU10UWkxVVpYTjBhMkZ5ZEdVdE9EZ3pNVEV3TURBd01USTVNRFk1TVIwd0d3WURWUVFGRXhRNE1ESTNOamc0TXpFeE1EQXdNREV5T1RBMk9URVJNQThHQTFVRUJBd0lRbVYxZEd6RHJXNHhFREFPQmdOVkJDb01CMVJvYjNKaVpXNHhIekFkQmdOVkJBTU1GazV2Y21RZ1FYQnZkR2hsYTJWVVJWTlVMVTlPVEZrd2dnRWlNQTBHQ1NxR1NJYjNEUUVCQVFVQUE0SUJEd0F3Z2dFS0FvSUJBUURVMStDWk5QRkZEU3lQOVhaTHVKRnJJbytmM3FKYnovaDcxUTZ2NGFqbnByR2Y1eUE4RVM3YmtocVRCWHFsc3E5MWRtc0RESGZGRkNaanFsanRRNC9Ma21VdHVDM0p4YTA1SmgzbmhzSnV6U3NITVN3enVBdGxKYjlSbk1xWFQzN2IwNGZubUtCNHdZMUdjODlONkZCZVBXSkJnSXREdGVlRjBnbk1qL0ZkNDZCanA2QTNPKzk2R1VRakIyMS95a0FPcmVTbDJWdHRJZmxzNmVURjZtTThiZitvK0JadFc5bjVSOHFVWnR0U0pJTENHRm9WQVVMUkY5VldKSnpmVXF5aWZ0eFhDRWJ6cE95M1YxMlVnTHdnQWhoTDhRUkNBMFNTVVN5ZjBYZTcxNERzdHBYTE5wTC9VMzZUSHlNcmdTVnF0bFRXTnV4TW1iaXFHd3JjQlBpN0FnTUJBQUdqZ2dGYU1JSUJWakFUQmdOVkhTVUVEREFLQmdnckJnRUZCUWNEQWpBT0JnTlZIUThCQWY4RUJBTUNCYUF3SFFZRFZSME9CQllFRkJMSWpZWW92eUx3L21SQk1JVTdjYTQ5UnBNME1EZ0dDQ3NHQVFVRkJ3RUJCQ3d3S2pBb0JnZ3JCZ0VGQlFjd0FZWWNhSFIwY0RvdkwyVm9ZMkV1WjJWdFlYUnBheTVrWlM5dlkzTndMekFNQmdOVkhSTUJBZjhFQWpBQU1DQUdBMVVkSUFRWk1CY3dDZ1lJS29JVUFFd0VnU013Q1FZSEtvSVVBRXdFVFRBZkJnTlZIU01FR0RBV2dCUjY2ZUZ2NmhSWkZnWHVBK25UL1NHcjN1blpuakNCaEFZRkt5UUlBd01FZXpCNXBDZ3dKakVMTUFrR0ExVUVCaE1DUkVVeEZ6QVZCZ05WQkFvTURtZGxiV0YwYVdzZ1FtVnliR2x1TUUwd1N6QkpNRWN3Rnd3Vnc1Wm1abVZ1ZEd4cFkyaGxJRUZ3YjNSb1pXdGxNQWtHQnlxQ0ZBQk1CRFlUSVRNdFUwMURMVUl0VkdWemRHdGhjblJsTFRnNE16RXhNREF3TURFeU9UQTJPVEFOQmdrcWhraUc5dzBCQVFzRkFBT0NBUUVBTEYyT1g5SkZzUGhkY0hPaU5lT3IwaHhpLzkyMTl4NmxwUStVTlQwRlFETVNsSG1sR3hnQUZaWTc5OElMdmY4WEpDTDZSUXFyMXVoL1pFR2VleW8yNzZQMElKWjQvYXM5RzhZL3dXTldrbXhJN0N0Z1ZKU2Q2K1dwazYxMW5HMzZCaFRMSEloYytUWFI3T0x4ZzFYbWJpWm1Qcms0aU44L0FUN1dwQXFoOHYxUXBMTjJ1M2lsaGtnclpBNGJtODkyN2RxQThJNjVMUTROUVpnTitnZW00TEwxRmNkRkJzU1JtUk1HQ0ZUUklFUTBhRVQ1V29jRUFTdXdIYSsvdm1TdjBrd0hqd2d4VG0zbkl4ZEViZUpHTGlYdERHdHRyK3ZUbDFUdm0vdFBBWlNLVm5QMzh1dVhDVmRwTlowbmxoakc3QnJWTmVxVkFKdm1yYWVIcTRVVXRBPT0iXSwidHlwIjoiSldUIiwiY3R5IjoiTkpXVCIsImFsZyI6IlBTMjU2In0.eyJuand0IjoiZXlKaGJHY2lPaUpDVURJMU5sSXhJaXdpYTJsa0lqb2ljSFZyWDJsa2NGOXphV2NpTENKMGVYQWlPaUpLVjFRaWZRLmV5SnBjM01pT2lKb2RIUndjem92TDJsa2NDMXlaV1l1WVhCd0xuUnBMV1JwWlc1emRHVXVaR1VpTENKcFlYUWlPakUyTlRZME1qUXpOamtzSW1WNGNDSTZNVFkxTmpReU5EVTBPU3dpZEc5clpXNWZkSGx3WlNJNkltTm9ZV3hzWlc1blpTSXNJbXAwYVNJNkltWXhaRGs1WVdGa0xUbGhZalV0TkRVNVl5MDRNemRoTFdRME16Y3dPV1l3TURGa05DSXNJbk51WXlJNklqZ3pZekExTkRObE9USmtaRFEwTWpNNU5qWXlNR1kxWlRjeFlUTm1PVEU1SWl3aWMyTnZjR1VpT2lKdmNHVnVhV1FnWjJWdExXRjFkR2dpTENKamIyUmxYMk5vWVd4c1pXNW5aU0k2SW0xVUxVbHJlblIxVlVod1dYSmZWRnB4ZUhoS1pqbEJZbnB3TkVGNWFWaDVkMUpEUjI4NGJWbGFkbXNpTENKamIyUmxYMk5vWVd4c1pXNW5aVjl0WlhSb2IyUWlPaUpUTWpVMklpd2ljbVZ6Y0c5dWMyVmZkSGx3WlNJNkltTnZaR1VpTENKeVpXUnBjbVZqZEY5MWNta2lPaUpvZEhSd2N6b3ZMMmR6ZEc5d1pHZzBMblJ2Y0M1c2IyTmhiRG80TURrd0wyTmhiR3hpWVdOcklpd2lZMnhwWlc1MFgybGtJam9pUjBWTloyVnRZWFJCZFhRMWVrZENaVWRoY1ZJaUxDSnpkR0YwWlNJNkltWXhZbEZ5V2pSVFJYTnBTME5TVmpSV1RuRkhJaXdpYm05dVkyVWlPaUpOWW5kemRVaEpSWGhFUzNseFMwUkxVM05RY0NKOS5mS0NTQ3k5VjhuSG5VRERHTnFiRjJVMl9DTGk3NEZGWkduUnN1N21pVE9DV09GR2xPZ1FXV2FLYmllY3p6aU9lYURqb3oxYmpQWUdUOFVFZFVlUFc1ZyJ9.MRFRENbu0tb6Vj6erWItVQzA3Y7zZkfH6EEVY4e4MReV_0bvMvI6SINvdI8fsbRV3W8Q2cepmmHlU56MUcCt3WkLn93cD7-iPEydNJBpdBKhq7n6pgtJ9MBe8t52ZN7QIoYmTkoGym7cvP2zLI_JKlysNhfQq16d_ucKlkB_o8tKU1P39s6VWVdpBGLK9AGESVXAiVIlAICPYvBLPsAa-1zzCq7BmMFT_VmU1smyV8Y2Cnnurh8vPNP5wD1NjzrVpLlePfDqnQHLp-vcXGs7RRanBvfcu143p4SI4lLV6gO7l2XWog1v5TdBZyi937VQ4ikJHLGx1OBMRyDJMgM7Wg';

const signedChallengeFromConnector = 'abc';

const PIN_STATUS = 'VERIFIED';
const JWS_DATA_MOCKED = {
  HBA: 'eyJ4NWMiOlsiTUlJRldEQ0NCRUNnQXdJQkFnSUhBVjFPZ2FwMmhqQU5CZ2txaGtpRzl3MEJBUXNGQURDQm1qRUxNQWtHQTFVRUJoTUNSRVV4SHpBZEJnTlZCQW9NRm1kbGJXRjBhV3NnUjIxaVNDQk9UMVF0VmtGTVNVUXhTREJHQmdOVkJBc01QMGx1YzNScGRIVjBhVzl1SUdSbGN5QkhaWE4xYm1Sb1pXbDBjM2RsYzJWdWN5MURRU0JrWlhJZ1ZHVnNaVzFoZEdscmFXNW1jbUZ6ZEhKMWEzUjFjakVnTUI0R0ExVUVBd3dYUjBWTkxsTk5RMEl0UTBFeU5DQlVSVk5VTFU5T1RGa3dIaGNOTWpBd05qRXdNREF3TURBd1doY05NalV3TmpBNU1qTTFPVFU1V2pDQjN6RUxNQWtHQTFVRUJoTUNSRVV4RXpBUkJnTlZCQWNNQ2tkbGNuTjBhRzltWlc0eERqQU1CZ05WQkJFTUJUZzJNelk0TVJvd0dBWURWUVFKREJGUGRIUnZMVWhoYUc0dFUzUnlMaUE1T1RFcU1DZ0dBMVVFQ2d3aE15MVRUVU10UWkxVVpYTjBhMkZ5ZEdVdE9EZ3pNVEV3TURBd01USTVNRFk1TVIwd0d3WURWUVFGRXhRNE1ESTNOamc0TXpFeE1EQXdNREV5T1RBMk9URVJNQThHQTFVRUJBd0lRbVYxZEd6RHJXNHhFREFPQmdOVkJDb01CMVJvYjNKaVpXNHhIekFkQmdOVkJBTU1GazV2Y21RZ1FYQnZkR2hsYTJWVVJWTlVMVTlPVEZrd2dnRWlNQTBHQ1NxR1NJYjNEUUVCQVFVQUE0SUJEd0F3Z2dFS0FvSUJBUURVMStDWk5QRkZEU3lQOVhaTHVKRnJJbytmM3FKYnovaDcxUTZ2NGFqbnByR2Y1eUE4RVM3YmtocVRCWHFsc3E5MWRtc0RESGZGRkNaanFsanRRNC9Ma21VdHVDM0p4YTA1SmgzbmhzSnV6U3NITVN3enVBdGxKYjlSbk1xWFQzN2IwNGZubUtCNHdZMUdjODlONkZCZVBXSkJnSXREdGVlRjBnbk1qL0ZkNDZCanA2QTNPKzk2R1VRakIyMS95a0FPcmVTbDJWdHRJZmxzNmVURjZtTThiZitvK0JadFc5bjVSOHFVWnR0U0pJTENHRm9WQVVMUkY5VldKSnpmVXF5aWZ0eFhDRWJ6cE95M1YxMlVnTHdnQWhoTDhRUkNBMFNTVVN5ZjBYZTcxNERzdHBYTE5wTC9VMzZUSHlNcmdTVnF0bFRXTnV4TW1iaXFHd3JjQlBpN0FnTUJBQUdqZ2dGYU1JSUJWakFUQmdOVkhTVUVEREFLQmdnckJnRUZCUWNEQWpBT0JnTlZIUThCQWY4RUJBTUNCYUF3SFFZRFZSME9CQllFRkJMSWpZWW92eUx3L21SQk1JVTdjYTQ5UnBNME1EZ0dDQ3NHQVFVRkJ3RUJCQ3d3S2pBb0JnZ3JCZ0VGQlFjd0FZWWNhSFIwY0RvdkwyVm9ZMkV1WjJWdFlYUnBheTVrWlM5dlkzTndMekFNQmdOVkhSTUJBZjhFQWpBQU1DQUdBMVVkSUFRWk1CY3dDZ1lJS29JVUFFd0VnU013Q1FZSEtvSVVBRXdFVFRBZkJnTlZIU01FR0RBV2dCUjY2ZUZ2NmhSWkZnWHVBK25UL1NHcjN1blpuakNCaEFZRkt5UUlBd01FZXpCNXBDZ3dKakVMTUFrR0ExVUVCaE1DUkVVeEZ6QVZCZ05WQkFvTURtZGxiV0YwYVdzZ1FtVnliR2x1TUUwd1N6QkpNRWN3Rnd3Vnc1Wm1abVZ1ZEd4cFkyaGxJRUZ3YjNSb1pXdGxNQWtHQnlxQ0ZBQk1CRFlUSVRNdFUwMURMVUl0VkdWemRHdGhjblJsTFRnNE16RXhNREF3TURFeU9UQTJPVEFOQmdrcWhraUc5dzBCQVFzRkFBT0NBUUVBTEYyT1g5SkZzUGhkY0hPaU5lT3IwaHhpLzkyMTl4NmxwUStVTlQwRlFETVNsSG1sR3hnQUZaWTc5OElMdmY4WEpDTDZSUXFyMXVoL1pFR2VleW8yNzZQMElKWjQvYXM5RzhZL3dXTldrbXhJN0N0Z1ZKU2Q2K1dwazYxMW5HMzZCaFRMSEloYytUWFI3T0x4ZzFYbWJpWm1Qcms0aU44L0FUN1dwQXFoOHYxUXBMTjJ1M2lsaGtnclpBNGJtODkyN2RxQThJNjVMUTROUVpnTitnZW00TEwxRmNkRkJzU1JtUk1HQ0ZUUklFUTBhRVQ1V29jRUFTdXdIYSsvdm1TdjBrd0hqd2d4VG0zbkl4ZEViZUpHTGlYdERHdHRyK3ZUbDFUdm0vdFBBWlNLVm5QMzh1dVhDVmRwTlowbmxoakc3QnJWTmVxVkFKdm1yYWVIcTRVVXRBPT0iXSwidHlwIjoiSldUIiwiY3R5IjoiTkpXVCIsImFsZyI6IlBTMjU2In0.eyJuand0IjoiZXlKaGJHY2lPaUpDVURJMU5sSXhJaXdpYTJsa0lqb2ljSFZyWDJsa2NGOXphV2NpTENKMGVYQWlPaUpLVjFRaWZRLmV5SnBjM01pT2lKb2RIUndjem92TDJsa2NDMXlaV1l1WVhCd0xuUnBMV1JwWlc1emRHVXVaR1VpTENKcFlYUWlPakUyTlRZME1qUXpOamtzSW1WNGNDSTZNVFkxTmpReU5EVTBPU3dpZEc5clpXNWZkSGx3WlNJNkltTm9ZV3hzWlc1blpTSXNJbXAwYVNJNkltWXhaRGs1WVdGa0xUbGhZalV0TkRVNVl5MDRNemRoTFdRME16Y3dPV1l3TURGa05DSXNJbk51WXlJNklqZ3pZekExTkRObE9USmtaRFEwTWpNNU5qWXlNR1kxWlRjeFlUTm1PVEU1SWl3aWMyTnZjR1VpT2lKdmNHVnVhV1FnWjJWdExXRjFkR2dpTENKamIyUmxYMk5vWVd4c1pXNW5aU0k2SW0xVUxVbHJlblIxVlVod1dYSmZWRnB4ZUhoS1pqbEJZbnB3TkVGNWFWaDVkMUpEUjI4NGJWbGFkbXNpTENKamIyUmxYMk5vWVd4c1pXNW5aVjl0WlhSb2IyUWlPaUpUTWpVMklpd2ljbVZ6Y0c5dWMyVmZkSGx3WlNJNkltTnZaR1VpTENKeVpXUnBjbVZqZEY5MWNta2lPaUpvZEhSd2N6b3ZMMmR6ZEc5d1pHZzBMblJ2Y0M1c2IyTmhiRG80TURrd0wyTmhiR3hpWVdOcklpd2lZMnhwWlc1MFgybGtJam9pUjBWTloyVnRZWFJCZFhRMWVrZENaVWRoY1ZJaUxDSnpkR0YwWlNJNkltWXhZbEZ5V2pSVFJYTnBTME5TVmpSV1RuRkhJaXdpYm05dVkyVWlPaUpOWW5kemRVaEpSWGhFUzNseFMwUkxVM05RY0NKOS5mS0NTQ3k5VjhuSG5VRERHTnFiRjJVMl9DTGk3NEZGWkduUnN1N21pVE9DV09GR2xPZ1FXV2FLYmllY3p6aU9lYURqb3oxYmpQWUdUOFVFZFVlUFc1ZyJ9.MRFRENbu0tb6Vj6erWItVQzA3Y7zZkfH6EEVY4e4MReV_0bvMvI6SINvdI8fsbRV3W8Q2cepmmHlU56MUcCt3WkLn93cD7-iPEydNJBpdBKhq7n6pgtJ9MBe8t52ZN7QIoYmTkoGym7cvP2zLI_JKlysNhfQq16d_ucKlkB_o8tKU1P39s6VWVdpBGLK9AGESVXAiVIlAICPYvBLPsAa-1zzCq7BmMFT_VmU1smyV8Y2Cnnurh8vPNP5wD1NjzrVpLlePfDqnQHLp-vcXGs7RRanBvfcu143p4SI4lLV6gO7l2XWog1v5TdBZyi937VQ4ikJHLGx1OBMRyDJMgM7Wg',
  'SMC-B':
    'eyJ4NWMiOlsiTUlJRldEQ0NCRUNnQXdJQkFnSUhBVjFPZ2FwMmhqQU5CZ2txaGtpRzl3MEJBUXNGQURDQm1qRUxNQWtHQTFVRUJoTUNSRVV4SHpBZEJnTlZCQW9NRm1kbGJXRjBhV3NnUjIxaVNDQk9UMVF0VmtGTVNVUXhTREJHQmdOVkJBc01QMGx1YzNScGRIVjBhVzl1SUdSbGN5QkhaWE4xYm1Sb1pXbDBjM2RsYzJWdWN5MURRU0JrWlhJZ1ZHVnNaVzFoZEdscmFXNW1jbUZ6ZEhKMWEzUjFjakVnTUI0R0ExVUVBd3dYUjBWTkxsTk5RMEl0UTBFeU5DQlVSVk5VTFU5T1RGa3dIaGNOTWpBd05qRXdNREF3TURBd1doY05NalV3TmpBNU1qTTFPVFU1V2pDQjN6RUxNQWtHQTFVRUJoTUNSRVV4RXpBUkJnTlZCQWNNQ2tkbGNuTjBhRzltWlc0eERqQU1CZ05WQkJFTUJUZzJNelk0TVJvd0dBWURWUVFKREJGUGRIUnZMVWhoYUc0dFUzUnlMaUE1T1RFcU1DZ0dBMVVFQ2d3aE15MVRUVU10UWkxVVpYTjBhMkZ5ZEdVdE9EZ3pNVEV3TURBd01USTVNRFk1TVIwd0d3WURWUVFGRXhRNE1ESTNOamc0TXpFeE1EQXdNREV5T1RBMk9URVJNQThHQTFVRUJBd0lRbVYxZEd6RHJXNHhFREFPQmdOVkJDb01CMVJvYjNKaVpXNHhIekFkQmdOVkJBTU1GazV2Y21RZ1FYQnZkR2hsYTJWVVJWTlVMVTlPVEZrd2dnRWlNQTBHQ1NxR1NJYjNEUUVCQVFVQUE0SUJEd0F3Z2dFS0FvSUJBUURVMStDWk5QRkZEU3lQOVhaTHVKRnJJbytmM3FKYnovaDcxUTZ2NGFqbnByR2Y1eUE4RVM3YmtocVRCWHFsc3E5MWRtc0RESGZGRkNaanFsanRRNC9Ma21VdHVDM0p4YTA1SmgzbmhzSnV6U3NITVN3enVBdGxKYjlSbk1xWFQzN2IwNGZubUtCNHdZMUdjODlONkZCZVBXSkJnSXREdGVlRjBnbk1qL0ZkNDZCanA2QTNPKzk2R1VRakIyMS95a0FPcmVTbDJWdHRJZmxzNmVURjZtTThiZitvK0JadFc5bjVSOHFVWnR0U0pJTENHRm9WQVVMUkY5VldKSnpmVXF5aWZ0eFhDRWJ6cE95M1YxMlVnTHdnQWhoTDhRUkNBMFNTVVN5ZjBYZTcxNERzdHBYTE5wTC9VMzZUSHlNcmdTVnF0bFRXTnV4TW1iaXFHd3JjQlBpN0FnTUJBQUdqZ2dGYU1JSUJWakFUQmdOVkhTVUVEREFLQmdnckJnRUZCUWNEQWpBT0JnTlZIUThCQWY4RUJBTUNCYUF3SFFZRFZSME9CQllFRkJMSWpZWW92eUx3L21SQk1JVTdjYTQ5UnBNME1EZ0dDQ3NHQVFVRkJ3RUJCQ3d3S2pBb0JnZ3JCZ0VGQlFjd0FZWWNhSFIwY0RvdkwyVm9ZMkV1WjJWdFlYUnBheTVrWlM5dlkzTndMekFNQmdOVkhSTUJBZjhFQWpBQU1DQUdBMVVkSUFRWk1CY3dDZ1lJS29JVUFFd0VnU013Q1FZSEtvSVVBRXdFVFRBZkJnTlZIU01FR0RBV2dCUjY2ZUZ2NmhSWkZnWHVBK25UL1NHcjN1blpuakNCaEFZRkt5UUlBd01FZXpCNXBDZ3dKakVMTUFrR0ExVUVCaE1DUkVVeEZ6QVZCZ05WQkFvTURtZGxiV0YwYVdzZ1FtVnliR2x1TUUwd1N6QkpNRWN3Rnd3Vnc1Wm1abVZ1ZEd4cFkyaGxJRUZ3YjNSb1pXdGxNQWtHQnlxQ0ZBQk1CRFlUSVRNdFUwMURMVUl0VkdWemRHdGhjblJsTFRnNE16RXhNREF3TURFeU9UQTJPVEFOQmdrcWhraUc5dzBCQVFzRkFBT0NBUUVBTEYyT1g5SkZzUGhkY0hPaU5lT3IwaHhpLzkyMTl4NmxwUStVTlQwRlFETVNsSG1sR3hnQUZaWTc5OElMdmY4WEpDTDZSUXFyMXVoL1pFR2VleW8yNzZQMElKWjQvYXM5RzhZL3dXTldrbXhJN0N0Z1ZKU2Q2K1dwazYxMW5HMzZCaFRMSEloYytUWFI3T0x4ZzFYbWJpWm1Qcms0aU44L0FUN1dwQXFoOHYxUXBMTjJ1M2lsaGtnclpBNGJtODkyN2RxQThJNjVMUTROUVpnTitnZW00TEwxRmNkRkJzU1JtUk1HQ0ZUUklFUTBhRVQ1V29jRUFTdXdIYSsvdm1TdjBrd0hqd2d4VG0zbkl4ZEViZUpHTGlYdERHdHRyK3ZUbDFUdm0vdFBBWlNLVm5QMzh1dVhDVmRwTlowbmxoakc3QnJWTmVxVkFKdm1yYWVIcTRVVXRBPT0iXSwidHlwIjoiSldUIiwiY3R5IjoiTkpXVCIsImFsZyI6IlBTMjU2In0.eyJuand0IjoiZXlKaGJHY2lPaUpDVURJMU5sSXhJaXdpYTJsa0lqb2ljSFZyWDJsa2NGOXphV2NpTENKMGVYQWlPaUpLVjFRaWZRLmV5SnBjM01pT2lKb2RIUndjem92TDJsa2NDMXlaV1l1WVhCd0xuUnBMV1JwWlc1emRHVXVaR1VpTENKcFlYUWlPakUyTlRZME1qUXpOamtzSW1WNGNDSTZNVFkxTmpReU5EVTBPU3dpZEc5clpXNWZkSGx3WlNJNkltTm9ZV3hzWlc1blpTSXNJbXAwYVNJNkltWXhaRGs1WVdGa0xUbGhZalV0TkRVNVl5MDRNemRoTFdRME16Y3dPV1l3TURGa05DSXNJbk51WXlJNklqZ3pZekExTkRObE9USmtaRFEwTWpNNU5qWXlNR1kxWlRjeFlUTm1PVEU1SWl3aWMyTnZjR1VpT2lKdmNHVnVhV1FnWjJWdExXRjFkR2dpTENKamIyUmxYMk5vWVd4c1pXNW5aU0k2SW0xVUxVbHJlblIxVlVod1dYSmZWRnB4ZUhoS1pqbEJZbnB3TkVGNWFWaDVkMUpEUjI4NGJWbGFkbXNpTENKamIyUmxYMk5vWVd4c1pXNW5aVjl0WlhSb2IyUWlPaUpUTWpVMklpd2ljbVZ6Y0c5dWMyVmZkSGx3WlNJNkltTnZaR1VpTENKeVpXUnBjbVZqZEY5MWNta2lPaUpvZEhSd2N6b3ZMMmR6ZEc5d1pHZzBMblJ2Y0M1c2IyTmhiRG80TURrd0wyTmhiR3hpWVdOcklpd2lZMnhwWlc1MFgybGtJam9pUjBWTloyVnRZWFJCZFhRMWVrZENaVWRoY1ZJaUxDSnpkR0YwWlNJNkltWXhZbEZ5V2pSVFJYTnBTME5TVmpSV1RuRkhJaXdpYm05dVkyVWlPaUpOWW5kemRVaEpSWGhFUzNseFMwUkxVM05RY0NKOS5mS0NTQ3k5VjhuSG5VRERHTnFiRjJVMl9DTGk3NEZGWkduUnN1N21pVE9DV09GR2xPZ1FXV2FLYmllY3p6aU9lYURqb3oxYmpQWUdUOFVFZFVlUFc1ZyJ9.MRFRENbu0tb6Vj6erWItVQzA3Y7zZkfH6EEVY4e4MReV_0bvMvI6SINvdI8fsbRV3W8Q2cepmmHlU56MUcCt3WkLn93cD7-iPEydNJBpdBKhq7n6pgtJ9MBe8t52ZN7QIoYmTkoGym7cvP2zLI_JKlysNhfQq16d_ucKlkB_o8tKU1P39s6VWVdpBGLK9AGESVXAiVIlAICPYvBLPsAa-1zzCq7BmMFT_VmU1smyV8Y2Cnnurh8vPNP5wD1NjzrVpLlePfDqnQHLp-vcXGs7RRanBvfcu143p4SI4lLV6gO7l2XWog1v5TdBZyi937VQ4ikJHLGx1OBMRyDJMgM7Wg',
};
const cardData = {
  HBA: {
    cardType: ECardTypes.HBA,
    certificate: '',
    pinStatus: PIN_STATUS,
    cardHandle: 'HbaCardHandle',
    ctId: 'id',
    slotNr: '2',
    iccsn: '80276883110000129000',
  },
  'SMC-B': {
    cardType: ECardTypes.SMCB,
    certificate: '',
    pinStatus: PIN_STATUS,
    cardHandle: 'SmcbCardHandle',
    ctId: 'id',
    slotNr: '2',
    iccsn: '80276883110000129000',
  },
};
const getPinStatusResponse: TPinStatusResponse = {
  statusResult: 'OK',
  pinStatus: PIN_STATUS,
};

export class JwsTest extends GemIdpJwsOptions {
  firstMethod() {
    super.createJwsOptions();
  }

  secondMethod() {
    super.createSigningInputString('', '').then((result: any) => {
      return result;
    });
  }

  thirdMethod() {
    super.base2urlEncode('');
  }

  fourthMethod() {
    super.sha256Encode('').then((result: any) => {
      return result;
    });
  }
}

jest.mock('@/renderer/modules/connector/connector_impl/certificate-reader-launcher', () => ({
  launch: (cardHandle: 'HbaCardHandle' | 'SmcbCardHandle'): string => {
    return CERT_MOCKS[cardHandle];
  },
}));

jest.mock('@/renderer/modules/connector/connector_impl/check-pin-status', () => ({
  getPinStatus: () => Promise.resolve(getPinStatusResponse),
}));

jest.mock('@/renderer/modules/connector/connector_impl/get-cards-launcher', () => ({
  launch: (type: 'HBA' | 'SMC-B') => Promise.resolve(cardData[type]),
}));

jest.mock('@/renderer/modules/connector/connector_impl/auth-sign-launcher', () => ({
  launch: (type: 'HBA' | 'SMC-B', _cardHandle: any, _flowType: string) =>
    Promise.resolve(() => {
      return JWS_DATA_MOCKED[type];
    }),
}));

jest.mock('base64url', () => ({
  fromBase64: (_input: string) => Promise.resolve(''),
}));
jest.mock('@/renderer/service/jws-sign-options', () => ({
  JwsSignOptions: jest.fn().mockImplementation(() => {
    return {
      base2urlEncode: (_input: string) => Promise.resolve(''),
    };
  }),
}));

/*jest.mock('@/renderer/modules/auth-service', () => {
  const ogrJwsMock = { createJwsOptions: jest.fn().mockReturnThis() };
  return { OgrJwsOptions: jest.fn(() => ogrJwsMock) };
});
jest.mock('@/renderer/modules/gem-idp/sign-feature/cidp-sign-options', () => {
  const cIdpJwsMock = { createJwsOptions: jest.fn().mockReturnThis() };
  return { GemIdpJwsOptions: jest.fn((header: string, payload: string) => cIdpJwsMock) };
});
jest.mock('@/renderer/modules/signature-sign-feature/jws-sign-options', () => {
  const jwsUtil = { createSigningInputString: jest.fn().mockReturnThis() };
  return { JwsSignOptions: jest.fn().mockImplementation(() => jwsUtil) };
});*/

// let testOgrSpyClass = new OgrJwsOptionsTest('challengeTest', 'certTest', ECardTypes.SMCB);
const testOgrSpyClass = new OgrJwsOptions('challengeTest', 'certTest', ECardTypes.SMCB);
// let testCIdpSpyClass = new OgrJwsOptionsTest('challengeTest', 'certTest', ECardTypes.SMCB);
const testCIdpSpyClass = new GemIdpJwsOptions('challengeTest', 'certTest', ECardTypes.SMCB);
jest.mock('@/renderer/service/jws-sign-options', () => ({
  OgrJwsSignOptions: jest.fn().mockImplementation(() => {
    return {
      getComposeSigningInput: (_input: string, _value: string) => {
        return '';
      },
    };
  }),
}));
jest.mock('@/renderer/service/jws-sign-options', () => ({
  CIdpJwsSignOptions: jest.fn().mockImplementation(() => {
    return {
      getComposeSigningInput: (_input: string, _value: string) => {
        return '';
      },
    };
  }),
}));
jest.mock('@/renderer/service/jws-sign-options', () => ({
  JwsSignOptions: jest.fn().mockReturnValue(() => {
    return {
      sha256Encode: (_input: string) => {
        return '';
      },
    };
  }),
}));

describe('connector module actions', () => {
  beforeEach(() => {
    store.commit('connectorStore/setHbaCardData', cardData['HBA']);
    store.commit('connectorStore/setSmcbCardData', cardData['SMC-B']);
  });
  afterEach(() => {
    store.commit('connectorStore/resetStore');
  });

  it('CardHandle for HBA', async () => {
    // set anc check checkPinStatus

    expect(async () => {
      await store.dispatch('connectorStore/getCardHandle', ECardTypes.HBA);
    }).not.toThrow();

    await store.dispatch('connectorStore/getCardHandle', ECardTypes.HBA);
    expect(store.state.connectorStore.cards['HBA']?.cardHandle).toBe(cardData['HBA'].cardHandle);
  });

  it('CardHandle for SmcB', async () => {
    // set anc check checkPinStatus

    expect(async () => {
      await store.dispatch('connectorStore/getCardHandle', ECardTypes.SMCB);
    }).not.toThrow();

    await store.dispatch('connectorStore/getCardHandle', ECardTypes.SMCB);
    expect(store.state.connectorStore.cards['SMC-B']?.cardHandle).toBe(cardData['SMC-B'].cardHandle);
  });

  it('checkPinStatus  Verified for HBA', async () => {
    // set anc check checkPinStatus

    expect(async () => {
      await store.dispatch('connectorStore/checkPinStatus', ECardTypes.HBA);
    }).not.toThrow();

    const expected = await store.dispatch('connectorStore/checkPinStatus', ECardTypes.HBA);
    expect(store.state.connectorStore.cards['HBA']?.pinStatus).toBe(PIN_STATUS);
    expect(expected).toBeTruthy();
  });
  it('checkPinStatus Verified for SMCB', async () => {
    // set anc check checkPinStatus

    expect(async () => {
      await store.dispatch('connectorStore/checkPinStatus', ECardTypes.SMCB);
    }).not.toThrow();

    const expected = await store.dispatch('connectorStore/checkPinStatus', ECardTypes.SMCB);
    expect(store.state.connectorStore.cards['SMC-B']?.pinStatus).toBe(PIN_STATUS);
    expect(expected).toBeTruthy();
  });

  it('getCardCertificate for HBA', async () => {
    // set anc check hbaCardCertificate
    expect(async () => {
      await store.dispatch('connectorStore/getCardCertificate', ECardTypes.HBA);
    }).not.toThrow();

    await store.dispatch('connectorStore/getCardCertificate', ECardTypes.HBA);

    expect(store.state.connectorStore.cards[ECardTypes.HBA]?.certificate).toBe(CERT_MOCKS['HbaCardHandle']);
  });

  it('smcbCardCertificate for SMC-B', async () => {
    // set anc check smcbCardCertificate
    expect(async () => {
      await store.dispatch('connectorStore/getCardCertificate', ECardTypes.SMCB);
    }).not.toThrow();

    await store.dispatch('connectorStore/getCardCertificate', ECardTypes.SMCB);
    expect(store.state.connectorStore.cards['SMC-B']?.certificate).toBe(CERT_MOCKS['SmcbCardHandle']);
  });
  xit('OGR SignedAuthChallenge for SMC-B', async () => {
    const ogrSpyFirtMethod = jest.spyOn(testOgrSpyClass, 'createJwsOptions').mockReturnValue({
      protectedHeader: 'test1',
      payload: 'test2',
    });
    // set anc check smcbCardCertificate
    // const ogrSpySecMethod = jest
    //   .spyOn(testOgrSpyClass, 'createSigningInputString')
    //   .mockImplementation(() => Promise.resolve('test'));
    expect(ogrSpyFirtMethod).toBeCalledTimes(0);
    // expect(ogrSpySecMethod).toBeCalledTimes(1);
    const expectedJWS = await store.dispatch('connectorStore/getSignedAuthChallenge', ECardTypes.SMCB);
    expect(async () => {
      await store.dispatch('connectorStore/getSignedAuthChallenge', ECardTypes.SMCB);
    }).not.toThrow();
    expect(expectedJWS).toBe(JWS_SIGNATUR_MOCKED);
  });

  xit('Cidp SignedAuthChallenge for SMC-B', async () => {
    const cIdpSpyFirstMethod = jest.spyOn(testCIdpSpyClass, 'createJwsOptions').mockReturnValue({
      protectedHeader: 'test1',
      payload: 'test2',
    });
    // set anc check smcbCardCertificate
    const cIdpSpySecMethod = jest
      .spyOn(testCIdpSpyClass, 'createSigningInputString')
      .mockImplementation(() => Promise.resolve('test'));
    expect(cIdpSpyFirstMethod).toBeCalledTimes(1);
    expect(cIdpSpySecMethod).toBeCalledTimes(1);
    const expectedJWS = await store.dispatch('connectorStore/getSignedAuthChallenge', ECardTypes.SMCB);
    expect(async () => {
      await store.dispatch('connectorStore/getSignedAuthChallenge', ECardTypes.SMCB);
    }).not.toThrow();
    expect(expectedJWS).toBe(JWS_SIGNATUR_MOCKED);
  });
});
