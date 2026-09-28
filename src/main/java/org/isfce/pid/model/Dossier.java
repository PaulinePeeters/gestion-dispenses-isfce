package org.isfce.pid.model;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity(name = "TDOSSIER")
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED, force = true)
@AllArgsConstructor
@Getter
public class Dossier {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne
	@JoinColumn(name = "FKUSER", nullable = false)
	private final User user;
	private final LocalDate date;
	@Lob
	@Column(nullable = false)
	private String objetDemande;
	@Setter
	@Column(nullable = false, length = 30)
	@Enumerated(EnumType.STRING)
	private EtatDossier etat;

	@Builder.Default
	@jakarta.persistence.OneToMany(mappedBy = "dossier", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
	private java.util.List<Document> documents = new java.util.ArrayList<>();
}
