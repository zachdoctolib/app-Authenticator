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

import { createI18n } from 'vue-i18n';

import de from './translations/de.json';
// import en from './translations/en';

// Ready translated locale messages
const messages = {
  // en,
  de,
};

// Create VueI18n instance with options
export default createI18n({
  locale: 'de', // navigator.language.substr(0, 2),
  fallbackLocale: 'de',
  messages, // set locale messages
});
