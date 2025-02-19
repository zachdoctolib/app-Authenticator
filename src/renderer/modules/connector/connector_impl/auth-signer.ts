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

import { SOAP_ACTION, SOAP_ACTION_CONTENT_TYPE } from '@/renderer/modules/connector/constants';
import { TAuthSignParameter, TContextParameter } from '../type-definitions/common-types';

import template from '@/renderer/modules/connector/assets/soap_templates/commonPTV/auth-sign.xml';
import { getConnectorEndpoint, httpReqConfig } from '@/renderer/modules/connector/services';
import { IPC_OGR_IDP_START_EVENT } from '@/constants';

export const runSoapRequest = async (
  contextParameter: TContextParameter,
  endpoint: string,
  cardHandle: string,
  authSignParameter: TAuthSignParameter,
  flowType: string,
): Promise<string> => {
  const envelope = getTemplate(cardHandle, contextParameter, authSignParameter, flowType);
  const requestHeaders = {
    'Content-Type': SOAP_ACTION_CONTENT_TYPE,
    soapAction: SOAP_ACTION.ExternalAuthenticate,
  };

  const url = getConnectorEndpoint(endpoint);
  const { data } = await window.api.httpPost(url, envelope, httpReqConfig(requestHeaders));
  return data;
};

const getTemplate = (
  cardHandle: string,
  contextParameter: TContextParameter,
  authSignParameter: TAuthSignParameter,
  flowType: string,
) => {
  return template
    .replace('{MANDANT}', contextParameter.mandantId)
    .replace('{CLIENT}', contextParameter.clientId)
    .replace('{WORKPLACE}', contextParameter.workplaceId)
    .replace('{USER}', contextParameter.userId)
    .replace('{CARDHANDLE}', cardHandle)
    .replace('{SIGNATURETYPE}', authSignParameter.signatureType)
    .replace(
      '{SIGNATURESCHEME}',
      flowType == IPC_OGR_IDP_START_EVENT
        ? authSignParameter.signatureKeycloackSchemes
        : authSignParameter.signatureCidpSchemes,
    )
    .replace('{BASE64DATA}', authSignParameter.base64data);
};
