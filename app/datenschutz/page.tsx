import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-3xl mx-auto px-4 py-12 md:py-16">
        <article className="prose prose-slate prose-lg max-w-none">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-8">Datenschutzerklärung</h1>
          
          <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">1. Datenschutz auf einen Blick</h2>
          
          <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Allgemeine Hinweise</h3>
          <p className="text-lg leading-relaxed">
            Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
          </p>
          
          <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Datenerfassung auf dieser Website</h3>
          
          <h4 className="text-lg font-semibold text-slate-900 mt-4 mb-2">Wer ist verantwortlich für die Datenerfassung auf dieser Website?</h4>
          <p className="text-lg leading-relaxed">
            Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Impressum dieser Website entnehmen.
          </p>
          
          <h4 className="text-lg font-semibold text-slate-900 mt-4 mb-2">Wie erfassen wir Ihre Daten?</h4>
          <p className="text-lg leading-relaxed">
            Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich z. B. um Daten handeln, die Sie in ein Kontaktformular eingeben oder wenn Sie eine Website-URL in unseren Scanner eingeben.
          </p>
          <p className="text-lg leading-relaxed">
            Andere Daten werden automatisch beim Besuch der Website durch unsere IT-Systeme erfasst. Das sind vor allem technische Daten (z. B. Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs). Die Erfassung dieser Daten erfolgt automatisch, sobald Sie diese Website betreten.
          </p>
          
          <h4 className="text-lg font-semibold text-slate-900 mt-4 mb-2">Wofür nutzen wir Ihre Daten?</h4>
          <p className="text-lg leading-relaxed">
            Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu gewährleisten. Andere Daten können zur Analyse Ihres Nutzerverhaltens verwendet werden.
          </p>
          
          <h4 className="text-lg font-semibold text-slate-900 mt-4 mb-2">Welche Rechte haben Sie bezüglich Ihrer Daten?</h4>
          <p className="text-lg leading-relaxed">
            Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die Berichtigung oder Löschung dieser Daten zu verlangen. Hierzu sowie zu weiteren Fragen zum Thema Datenschutz können Sie sich jederzeit unter der im Impressum angegebenen Adresse an uns wenden.
          </p>
          
          <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">2. Hosting</h2>
          
          <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Externes Hosting (Vercel)</h3>
          <p className="text-lg leading-relaxed">
            Diese Website wird bei einem externen Dienstleister gehostet (Hoster). Die personenbezogenen Daten, die auf dieser Website erfasst werden, werden auf den Servern des Hosters gespeichert. Hierbei kann es sich v. a. um IP-Adressen, Kontaktanfragen, Meta- und Kommunikationsdaten, Vertragsdaten, Kontaktdaten, Namen, Websitezugriffe und sonstige Daten, die über eine Website generiert werden, handeln.
          </p>
          <p className="text-lg leading-relaxed">
            Der Einsatz des Hosters erfolgt zum Zwecke der Vertragserfüllung gegenüber unseren potenziellen und bestehenden Kunden (Art. 6 Abs. 1 lit. b DSGVO) und im Interesse einer sicheren, schnellen und effizienten Bereitstellung unseres Online-Angebots durch einen professionellen Anbieter (Art. 6 Abs. 1 lit. f DSGVO).
          </p>
          
          <p className="text-lg leading-relaxed mt-4">
            <strong>Unser Hoster:</strong><br />
            Vercel Inc.<br />
            340 S Lemon Ave #4133<br />
            Walnut, CA 91789, USA
          </p>
          
          <p className="text-lg leading-relaxed">
            Unser Hoster wird Ihre Daten nur insoweit verarbeiten, wie dies zur Erfüllung seiner Leistungspflichten erforderlich ist und unsere Weisungen in Bezug auf diese Daten befolgen.
          </p>
          
          <h4 className="text-lg font-semibold text-slate-900 mt-4 mb-2">Abschluss eines Vertrages über Auftragsverarbeitung</h4>
          <p className="text-lg leading-relaxed">
            Um die datenschutzkonforme Verarbeitung zu gewährleisten, haben wir einen Vertrag über Auftragsverarbeitung mit unserem Hoster geschlossen.
          </p>
          
          <h4 className="text-lg font-semibold text-slate-900 mt-4 mb-2">Datenübertragung in die USA</h4>
          <p className="text-lg leading-relaxed">
            Die Datenübertragung in die USA wird auf die Standardvertragsklauseln der EU-Kommission gestützt. Details finden Sie hier:{' '}
            <a 
              href="https://vercel.com/legal/privacy-policy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline break-all"
            >
              https://vercel.com/legal/privacy-policy
            </a>
          </p>
          
          <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">3. Allgemeine Hinweise und Pflichtinformationen</h2>
          
          <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Datenschutz</h3>
          <p className="text-lg leading-relaxed">
            Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
          </p>
          <p className="text-lg leading-relaxed">
            Wenn Sie diese Website benutzen, werden verschiedene personenbezogene Daten erhoben. Personenbezogene Daten sind Daten, mit denen Sie persönlich identifiziert werden können. Die vorliegende Datenschutzerklärung erläutert, welche Daten wir erheben und wofür wir sie nutzen. Sie erläutert auch, wie und zu welchem Zweck das geschieht.
          </p>
          <p className="text-lg leading-relaxed">
            Wir weisen darauf hin, dass die Datenübertragung im Internet (z. B. bei der Kommunikation per E-Mail) Sicherheitslücken aufweisen kann. Ein lückenloser Schutz der Daten vor dem Zugriff durch Dritte ist nicht möglich.
          </p>
          
          <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Hinweis zur verantwortlichen Stelle</h3>
          <p className="text-lg leading-relaxed">
            Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:
          </p>
          <p className="text-lg leading-relaxed">
            <strong>Marcus van Dinther & Luis Hammann SiteSweep GbR</strong><br />
            Dubliner Weg 4<br />
            50259 Pulheim<br />
            <br />
            Telefon: <a href="tel:+4915679739925" className="text-primary hover:underline">+49 15679 739925</a><br />
            E-Mail: <a href="mailto:info@sitesweep.de" className="text-primary hover:underline">info@sitesweep.de</a>
          </p>
          <p className="text-lg leading-relaxed">
            Verantwortliche Stelle ist die natürliche oder juristische Person, die allein oder gemeinsam mit anderen über die Zwecke und Mittel der Verarbeitung von personenbezogenen Daten (z. B. Namen, E-Mail-Adressen o. Ä.) entscheidet.
          </p>
          
          <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Speicherdauer</h3>
          <p className="text-lg leading-relaxed">
            Soweit innerhalb dieser Datenschutzerklärung keine speziellere Speicherdauer genannt wurde, verbleiben Ihre personenbezogenen Daten bei uns, bis der Zweck für die Datenverarbeitung entfällt. Wenn Sie ein berechtigtes Löschersuchen geltend machen oder eine Einwilligung zur Datenverarbeitung widerrufen, werden Ihre Daten gelöscht, sofern wir keine anderen rechtlich zulässigen Gründe für die Speicherung Ihrer personenbezogenen Daten haben (z. B. steuer- oder handelsrechtliche Aufbewahrungsfristen); im letztgenannten Fall erfolgt die Löschung nach Fortfall dieser Gründe.
          </p>
          
          <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Widerruf Ihrer Einwilligung zur Datenverarbeitung</h3>
          <p className="text-lg leading-relaxed">
            Viele Datenverarbeitungsvorgänge sind nur mit Ihrer ausdrücklichen Einwilligung möglich. Sie können eine bereits erteilte Einwilligung jederzeit widerrufen. Dazu reicht eine formlose Mitteilung per E-Mail an uns. Die Rechtmäßigkeit der bis zum Widerruf erfolgten Datenverarbeitung bleibt vom Widerruf unberührt.
          </p>
          
          <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Auskunft, Löschung und Berichtigung</h3>
          <p className="text-lg leading-relaxed">
            Sie haben im Rahmen der geltenden gesetzlichen Bestimmungen jederzeit das Recht auf unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen Daten, deren Herkunft und Empfänger und den Zweck der Datenverarbeitung und ggf. ein Recht auf Berichtigung oder Löschung dieser Daten. Hierzu sowie zu weiteren Fragen zum Thema personenbezogene Daten können Sie sich jederzeit unter der im Impressum angegebenen Adresse an uns wenden.
          </p>
          
          <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">4. Datenerfassung auf dieser Website</h2>
          
          <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Server-Log-Dateien</h3>
          <p className="text-lg leading-relaxed">
            Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt. Dies sind:
          </p>
          <ul className="list-disc list-inside text-lg leading-relaxed ml-4">
            <li>Browsertyp und Browserversion</li>
            <li>verwendetes Betriebssystem</li>
            <li>Referrer URL</li>
            <li>Hostname des zugreifenden Rechners</li>
            <li>Uhrzeit der Serveranfrage</li>
            <li>IP-Adresse</li>
          </ul>
          <p className="text-lg leading-relaxed">
            Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen.
          </p>
          <p className="text-lg leading-relaxed">
            Die Erfassung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Der Websitebetreiber hat ein berechtigtes Interesse an der technisch fehlerfreien Darstellung und der Optimierung seiner Website – hierzu müssen die Server-Log-Files erfasst werden.
          </p>
          
          <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Kontaktformular und E-Mail-Kontakt</h3>
          <p className="text-lg leading-relaxed">
            Wenn Sie uns per Kontaktformular, E-Mail oder Telefon Anfragen zukommen lassen, wird Ihre Anfrage inklusive aller daraus hervorgehenden personenbezogenen Daten (Name, Anfrage) zum Zwecke der Bearbeitung Ihres Anliegens bei uns gespeichert und verarbeitet. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.
          </p>
          <p className="text-lg leading-relaxed">
            Die Verarbeitung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO, sofern Ihre Anfrage mit der Erfüllung eines Vertrags zusammenhängt oder zur Durchführung vorvertraglicher Maßnahmen erforderlich ist. In allen übrigen Fällen beruht die Verarbeitung auf unserem berechtigten Interesse an der effektiven Bearbeitung der an uns gerichteten Anfragen (Art. 6 Abs. 1 lit. f DSGVO) oder auf Ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO) sofern diese abgefragt wurde.
          </p>
          <p className="text-lg leading-relaxed">
            Die von Ihnen im Kontaktformular eingegebenen Daten verbleiben bei uns, bis Sie uns zur Löschung auffordern, Ihre Einwilligung zur Speicherung widerrufen oder der Zweck für die Datenspeicherung entfällt (z. B. nach abgeschlossener Bearbeitung Ihrer Anfrage). Zwingende gesetzliche Bestimmungen – insbesondere Aufbewahrungsfristen – bleiben unberührt.
          </p>
          
          <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Website-Scanner-Funktion</h3>
          <p className="text-lg leading-relaxed">
            Wenn Sie unsere Scanner-Funktion nutzen und eine Website-URL eingeben, wird diese URL temporär verarbeitet, um die technische Analyse durchzuführen. Die eingegebene URL und die Scan-Ergebnisse werden gespeichert, um Ihnen das Ergebnis anzuzeigen und für statistische Zwecke.
          </p>
          <p className="text-lg leading-relaxed">
            Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung bzw. vorvertragliche Maßnahmen) sowie Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Bereitstellung unseres Dienstes).
          </p>
          <p className="text-lg leading-relaxed">
            Die Daten werden automatisch nach 90 Tagen gelöscht, sofern keine vertragliche Beziehung zustande gekommen ist. Auf Anfrage löschen wir Ihre Scan-Daten jederzeit vorzeitig.
          </p>
          
          <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">5. Plugins und Tools</h2>
          
          <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Calendly (Terminbuchung)</h3>
          <p className="text-lg leading-relaxed">
            Auf unserer Website haben Sie die Möglichkeit, Termine mit uns zu vereinbaren. Für die Terminbuchung nutzen wir das Tool „Calendly". Anbieter ist die Calendly LLC, 271 17th St NW, 10th Floor, Atlanta, Georgia 30363, USA (nachfolgend „Calendly").
          </p>
          <p className="text-lg leading-relaxed">
            Zum Zwecke der Terminbuchung geben Sie die abgefragten Daten und den Wunschtermin in die Maske ein. Die eingegebenen Daten werden zur Planung, Durchführung und ggf. zur Nachbereitung des Termins verwendet. Die Termindaten werden auf den Servern von Calendly gespeichert, deren Datenschutzerklärung Sie hier einsehen können:{' '}
            <a 
              href="https://calendly.com/privacy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline break-all"
            >
              https://calendly.com/privacy
            </a>
            .
          </p>
          <p className="text-lg leading-relaxed">
            Die von Ihnen eingegebenen Daten verbleiben bei uns bzw. bei Calendly, bis Sie uns zur Löschung auffordern, Ihre Einwilligung zur Speicherung widerrufen oder der Zweck für die Datenspeicherung entfällt. Zwingende gesetzliche Bestimmungen – insbesondere Aufbewahrungsfristen – bleiben unberührt.
          </p>
          <p className="text-lg leading-relaxed">
            Rechtsgrundlage für die Datenverarbeitung ist Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung bzw. vorvertragliche Maßnahmen) sowie unser berechtigtes Interesse an einer effizienten und zeitgemäßen Terminplanung (Art. 6 Abs. 1 lit. f DSGVO).
          </p>
          
          <h4 className="text-lg font-semibold text-slate-900 mt-4 mb-2">Datenübertragung in die USA</h4>
          <p className="text-lg leading-relaxed">
            Calendly ist in den USA ansässig. Die Datenübertragung in die USA wird auf Standardvertragsklauseln der EU-Kommission gestützt.
          </p>
          
          <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">6. Ihre Rechte</h2>
          <p className="text-lg leading-relaxed">
            Sie haben folgende Rechte bezüglich Ihrer personenbezogenen Daten:
          </p>
          <ul className="list-disc list-inside text-lg leading-relaxed ml-4">
            <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
            <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
            <li>Recht auf Löschung (Art. 17 DSGVO)</li>
            <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
            <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
            <li>Recht auf Widerspruch (Art. 21 DSGVO)</li>
            <li>Recht auf Beschwerde bei einer Aufsichtsbehörde (Art. 77 DSGVO)</li>
          </ul>
          
          <p className="text-lg leading-relaxed mt-6 text-slate-600 italic">
            Stand: November 2025
          </p>
        </article>
      </main>
      
      <Footer />
    </div>
  )
}

