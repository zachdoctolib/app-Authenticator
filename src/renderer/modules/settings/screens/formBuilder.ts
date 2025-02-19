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

import { IConfig, IConfigSection } from '@/@types/common-types';
import {
  CHECK_UPDATES_AUTOMATICALLY_CONFIG,
  CONTEXT_PARAMETERS_CONFIG_GROUP,
  ENTRY_OPTIONS_CONFIG_GROUP,
  PROXY_AUTH_TYPES,
  PROXY_SETTINGS_CONFIG,
  TLS_AUTH_TYPE_CONFIG,
} from '@/config';
import { COMMON_USED_REGEXES } from '@/constants';
import { TRepositoryData } from '@/renderer/modules/settings/repository';
import i18n from '@/renderer/i18n';
import { AuthenticatorError, UserfacingError } from '@/renderer/errors/errors';
import { ERROR_CODES } from '@/error-codes';
import { checkPemFileFormat, PEM_TYPES } from '@/renderer/utils/pem-file-validator';
import { copyPemFileToTargetDir } from '@/renderer/utils/read-tls-certificates';

/* @if MOCK_MODE == 'ENABLED' */
import {
  MOCK_CONNECTOR_CERTS_CONFIG,
  MOCK_CONNECTOR_CONFIG,
} from '@/renderer/modules/connector/connector-mock/mock-config';
/* @endif */

const translate = i18n.global.tc;

export function getFormSections(repositoryData: TRepositoryData): IConfigSection[] {
  let mocked = false;
  /* @if MOCK_MODE == 'ENABLED' */
  if (repositoryData[MOCK_CONNECTOR_CONFIG]) {
    mocked = true;
  }
  /* @endif */

  const BASIC_AUTH = 'BasicAuth';
  return [
    /* @if MOCK_MODE == 'ENABLED' */
    {
      title: 'Mock Konnektor',
      hide: false,
      columns: [
        {
          label: 'Status',
          key: MOCK_CONNECTOR_CONFIG,
          type: 'drop-down',
          optionsType: 'standardBool',
          required: false,
          infoText: translate('info_text_status'),
        },
        {
          label: 'SMC-B Certificate',
          key: MOCK_CONNECTOR_CERTS_CONFIG.SMCB_CERT,
          type: 'file-path',
          required: false,
          hide: !mocked,
          infoText: translate('info_text_smcb_certificate'),
          onChange: async (e: Event) => {
            const input = e.target as HTMLInputElement;
            const file = input.files && input.files[0];
            const fieldKey = MOCK_CONNECTOR_CERTS_CONFIG.SMCB_CERT;

            if (!file) {
              throw new AuthenticatorError('Invalid certificate selected for ' + fieldKey);
            }

            const fileAsString = await file?.text();

            try {
              await checkPemFileFormat(fileAsString, PEM_TYPES.CERT);
            } catch (err) {
              input.value = '';
              repositoryData[fieldKey] = '';
            }
          },
        },
        {
          label: 'SMC-B Private Key',
          key: MOCK_CONNECTOR_CERTS_CONFIG.SMCB_KEY,
          type: 'file-path',
          required: false,
          hide: !mocked,
          infoText: translate('info_text_smcb_private_key'),
          onChange: async (e: Event) => {
            const input = e.target as HTMLInputElement;
            const file = input.files && input.files[0];
            const fieldKey = MOCK_CONNECTOR_CERTS_CONFIG.SMCB_KEY;

            if (!file) {
              throw new AuthenticatorError('Invalid certificate selected for ' + fieldKey);
            }

            const fileAsString = await file?.text();

            try {
              await checkPemFileFormat(fileAsString, PEM_TYPES.KEY);
            } catch (err) {
              input.value = '';
              repositoryData[fieldKey] = '';
            }
          },
        },
        {
          label: 'HBA Certificate',
          key: MOCK_CONNECTOR_CERTS_CONFIG.HBA_CERT,
          type: 'file-path',
          required: false,
          hide: !mocked,
          infoText: translate('info_text_hba_certificate'),
          onChange: async (e: Event) => {
            const input = e.target as HTMLInputElement;
            const file = input.files && input.files[0];
            const fieldKey = MOCK_CONNECTOR_CERTS_CONFIG.HBA_CERT;

            if (!file) {
              throw new AuthenticatorError('Invalid certificate selected for ' + fieldKey);
            }

            const fileAsString = await file?.text();

            try {
              await checkPemFileFormat(fileAsString, PEM_TYPES.CERT);
            } catch (err) {
              input.value = '';
              repositoryData[fieldKey] = '';
            }
          },
        },
        {
          label: 'HBA Private Key',
          key: MOCK_CONNECTOR_CERTS_CONFIG.HBA_KEY,
          type: 'file-path',
          optionsType: 'standardBool',
          required: false,
          hide: !mocked,
          infoText: translate('info_text_hba_private_key'),
          onChange: async (e: Event) => {
            const input = e.target as HTMLInputElement;
            const file = input.files && input.files[0];
            const fieldKey = MOCK_CONNECTOR_CERTS_CONFIG.HBA_KEY;

            if (!file) {
              throw new AuthenticatorError('Invalid certificate selected for ' + fieldKey);
            }

            const fileAsString = await file?.text();

            try {
              await checkPemFileFormat(fileAsString, PEM_TYPES.KEY);
            } catch (err) {
              input.value = '';
              repositoryData[fieldKey] = '';
            }
          },
        },
      ],
    },
    /* @endif */
    {
      title: translate('connector_settings'),
      hide: mocked,
      icon: 'icon-connector.svg',
      columns: [
        {
          label: translate('host'),
          key: ENTRY_OPTIONS_CONFIG_GROUP.HOSTNAME,
          required: true,
          type: 'input',
          infoText: translate('info_text_host'),
        },
        {
          label: translate('port'),
          key: ENTRY_OPTIONS_CONFIG_GROUP.PORT,
          required: true,
          type: 'input',
          validationRegex: COMMON_USED_REGEXES.NUMBER,
          infoText: translate('info_text_port'),
        },
        {
          label: translate('mandant_id'),
          key: CONTEXT_PARAMETERS_CONFIG_GROUP.MANDANT_ID,
          required: true,
          type: 'input',
          validationRegex: COMMON_USED_REGEXES.CONNECTOR_ALLOWED,
          infoText: translate('info_text_mandant_id'),
        },
        {
          label: translate('client_id'),
          key: CONTEXT_PARAMETERS_CONFIG_GROUP.CLIENT_ID,
          required: true,
          type: 'input',
          validationRegex: COMMON_USED_REGEXES.CONNECTOR_ALLOWED,
          infoText: translate('info_text_client_id'),
        },
        {
          label: translate('work_space_id'),
          key: CONTEXT_PARAMETERS_CONFIG_GROUP.WORKPLACE_ID,
          required: true,
          type: 'input',
          validationRegex: COMMON_USED_REGEXES.CONNECTOR_ALLOWED,
          infoText: translate('info_text_work_space_id'),
        },
        {
          label: translate('tls_authentication'),
          key: TLS_AUTH_TYPE_CONFIG,
          type: 'drop-down',
          options: [
            {
              text: translate('username_password'),
              value: BASIC_AUTH,
            },
            { text: translate('certificate'), value: 'ServerClientCertAuth' },
            {
              text: translate('no_authentication'),
              value: 'ServerCertAuth',
            },
          ],
          required: false,
          infoText: translate('info_text_tls_authentication'),
        },
        {
          label: translate('reject_unauthorized'),
          key: ENTRY_OPTIONS_CONFIG_GROUP.TLS_REJECT_UNAUTHORIZED,
          required: false,
          type: 'drop-down',
          optionsType: 'standardBool',
          infoText: translate('info_text_reject_unauthorized'),
        },
        {
          label: translate('username_from_connector'),
          key: ENTRY_OPTIONS_CONFIG_GROUP.USERNAME_BASIC_AUTH,
          required: true,
          type: 'input',
          hide: repositoryData[TLS_AUTH_TYPE_CONFIG] !== BASIC_AUTH,
          infoText: translate('info_text_username_con'),
        },
        {
          label: translate('password_from_connector'),
          key: ENTRY_OPTIONS_CONFIG_GROUP.PASSWORD_BASIC_AUTH,
          required: true,
          type: 'password',
          hide: repositoryData[TLS_AUTH_TYPE_CONFIG] !== BASIC_AUTH,
          infoText: translate('info_text_password_con'),
        },
        {
          label: translate('private_key'),
          key: ENTRY_OPTIONS_CONFIG_GROUP.TLS_PRIVATE_KEY,
          type: 'file-path',
          required: true,
          hide: repositoryData[TLS_AUTH_TYPE_CONFIG] !== 'ServerClientCertAuth',
          infoText: translate('info_text_private_key'),
          /**
           * Moves file to right position and renames it
           * @param e
           */
          onChange: async (e: Event) => {
            const input = e.target as HTMLInputElement;
            const file = input.files && input.files[0];
            if (file === null) {
              throw new UserfacingError('Invalid Keyfile', 'Input File darf nicht NULL sein.', ERROR_CODES.AUTHCL_1114);
            }

            const keyFilename = file?.name.toString();
            const fileAsString = await file?.text();

            const fieldKey = ENTRY_OPTIONS_CONFIG_GROUP.TLS_PRIVATE_KEY;
            try {
              await checkPemFileFormat(fileAsString, PEM_TYPES.KEY);

              repositoryData[fieldKey] = await copyPemFileToTargetDir(file.path, fieldKey, keyFilename);
            } catch (err) {
              input.value = '';
              repositoryData[fieldKey] = '';
            }
          },
        },
        {
          label: translate('client_certificate'),
          key: ENTRY_OPTIONS_CONFIG_GROUP.TLS_CERTIFICATE,
          type: 'file-path',
          required: true,
          hide: repositoryData[TLS_AUTH_TYPE_CONFIG] !== 'ServerClientCertAuth',
          infoText: translate('info_text_client_certificate'),
          /**
           * Moves file to right position and renames it
           * @param e
           */
          onChange: async (e: Event) => {
            const input = e.target as HTMLInputElement;
            const file = input.files && input.files[0];
            if (file === null) {
              throw new UserfacingError(
                'Invalid Cert-file',
                'Input File darf nicht NULL sein.',
                ERROR_CODES.AUTHCL_1115,
              );
            }
            const certFilename = file?.name.toString();
            const fileAsString = await file?.text();

            const fieldKey = ENTRY_OPTIONS_CONFIG_GROUP.TLS_CERTIFICATE;
            try {
              await checkPemFileFormat(fileAsString, PEM_TYPES.CERT);

              repositoryData[fieldKey] = await copyPemFileToTargetDir(file.path, fieldKey, certFilename);
            } catch (err) {
              input.value = '';
              repositoryData[fieldKey] = '';
            }
          },
        },
      ],
    },
    {
      title: translate('proxy_settings'),
      hide: false,
      columns: [
        {
          label: translate('proxy_authentication_type'),
          key: PROXY_SETTINGS_CONFIG.AUTH_TYPE,
          type: 'drop-down',
          options: [
            {
              text: translate('no_proxy_authentication'),
              value: false,
            },
            {
              text: translate('proxy_basic_authentication'),
              value: PROXY_AUTH_TYPES.BASIC_AUTH,
            },
            {
              text: translate('proxy_certificate_authentication'),
              value: PROXY_AUTH_TYPES.PROXY_CLIENT_CERT,
            },
          ],
          required: false,
          infoText: translate('info_text_proxy_auth_type'),
        },
        {
          label: translate('proxy_username'),
          key: PROXY_SETTINGS_CONFIG.PROXY_USERNAME,
          required: true,
          type: 'input',
          hide: repositoryData[PROXY_SETTINGS_CONFIG.AUTH_TYPE] !== PROXY_AUTH_TYPES.BASIC_AUTH,
          infoText: translate('info_text_proxy_username'),
        },
        {
          label: translate('proxy_password'),
          key: PROXY_SETTINGS_CONFIG.PROXY_PASSWORD,
          required: true,
          type: 'password',
          hide: repositoryData[PROXY_SETTINGS_CONFIG.AUTH_TYPE] !== PROXY_AUTH_TYPES.BASIC_AUTH,
          infoText: translate('info_text_proxy_password'),
        },
        {
          label: translate('proxy_client_certificate'),
          key: PROXY_SETTINGS_CONFIG.PROXY_CERTIFICATE_PATH,
          type: 'file-path',
          required: true,
          hide: repositoryData[PROXY_SETTINGS_CONFIG.AUTH_TYPE] !== PROXY_AUTH_TYPES.PROXY_CLIENT_CERT,
          infoText: translate('info_text_proxy_client_certificate'),
          /**
           * Moves file to right position and renames it
           * @param e
           */
          onChange: async (e: Event) => {
            const input = e.target as HTMLInputElement;
            const file = input.files && input.files[0];
            if (file === null) {
              return;
            }
            const certFilename = file?.name.toString();
            const fileAsString = await file?.text();
            const fieldKey = PROXY_SETTINGS_CONFIG.PROXY_CERTIFICATE_PATH;
            try {
              await checkPemFileFormat(fileAsString, PEM_TYPES.CERT);

              repositoryData[fieldKey] = await copyPemFileToTargetDir(file.path, fieldKey, certFilename);
            } catch (err) {
              input.value = '';
              repositoryData[fieldKey] = '';
            }
          },
        },
        {
          label: translate('proxy_ignore_list'),
          key: PROXY_SETTINGS_CONFIG.PROXY_IGNORE_LIST,
          required: false,
          type: 'input',
          infoText: translate('info_text_proxy_ignore_list'),
        },
      ],
    },
    {
      title: translate('automatic_updates'),
      hide: false,
      columns: [
        {
          label: translate('check_updates_automatically'),
          key: CHECK_UPDATES_AUTOMATICALLY_CONFIG,
          type: 'drop-down',
          optionsType: 'standardBool',
          required: true,
          infoText: translate('info_text_check_updates_automatically'),
        },
      ],
    },
  ];
}

export function getFormColumnsFlat(repositoryData: TRepositoryData): Record<string, IConfig> {
  const sections = getFormSections(repositoryData);
  const formSectionsFlat: Record<string, IConfig> = {};

  sections.forEach((section) => {
    section.columns.forEach((value) => {
      formSectionsFlat[value.key] = value;
    });
  });

  return formSectionsFlat;
}
