package com.fieldops.repository;

import com.fieldops.domain.entity.Client;
import com.fieldops.domain.enums.ClientStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ClientRepository extends JpaRepository<Client, UUID> {

    List<Client> findAllByOrderByCreatedAtDesc();

    List<Client> findByStatus(ClientStatus status);

    @Query("SELECT c FROM Client c LEFT JOIN FETCH c.sites WHERE c.id = :id")
    Optional<Client> findByIdWithSites(@Param("id") UUID id);
}
